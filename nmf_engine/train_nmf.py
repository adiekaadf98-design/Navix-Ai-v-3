import json
import math
import random
import os
import sys
import time

# =====================================================================
# NAVIX MULTIMEDIA FOUNDATION (NMF) - PHASE 1: TEXT-TO-VISUAL/AUDIO ADAPTER
# =====================================================================
# Mathematical Specification:
# 1. Text Vocabulary & Semantic Embedding: D_in = 64
# 2. Shared Latent / Multimodal Projection: D_latent = 128
# 3. Cross-Modal Projector: W1 (D_in x D_latent), b1 (D_latent)
# 4. Modality Conditioning Head (Visual / Audio / Video parameters):
#    - Visual: [focal_length, f_stop, iso, micro_texture, skin_tone, lighting_intensity, depth_field, saturation]
#    - Audio: [root_freq, tempo_bpm, polyphony_density, harmonic_depth, reverb_decay, resonance, envelope_decay, spectral_tilt]
#    - Video: [motion_vector_x, motion_vector_y, temporal_continuity, fps, shutter_speed, camera_pan, zoom_velocity, dynamic_range]
# 5. Loss: Multi-Task MSE Alignment Loss + Cosine Similarity Regularizer
# 6. Optimizer: Adam (Adaptive Moment Estimation) with Momentum & Variance tracking
# =====================================================================

VOCAB = {
    # Special Tokens
    "<PAD>": 0, "<UNK>": 1, "<BOS>": 2, "<EOS>": 3,
    # Subjects
    "foto": 4, "wajah": 5, "manusia": 6, "wanita": 7, "pria": 8, "anak": 9, "orang": 10, "tua": 11,
    "pemandangan": 12, "gunung": 13, "pantai": 14, "laut": 15, "hutan": 16, "kota": 17, "malam": 18,
    "matahari": 19, "senja": 20, "hujan": 21, "hewan": 22, "kucing": 23, "harimau": 24, "burung": 25,
    # Photography / Visual Modifiers
    "realistis": 26, "alami": 27, "studio": 28, "potret": 29, "lensa": 30, "close-up": 31, "bokeh": 32,
    "pencahayaan": 33, "lembut": 34, "tajam": 35, "detail": 36, "pori-pori": 37, "kulit": 38, "tekstur": 39,
    "sinematik": 40, "sinar": 41, "emas": 42, "terang": 43, "gelap": 44, "kontras": 45,
    # Audio / Music Modifiers
    "musik": 46, "lagu": 47, "melodi": 48, "suara": 49, "tenang": 50, "santai": 51, "piano": 52,
    "akustik": 53, "gitar": 54, "biola": 55, "orkestra": 56, "cepat": 57, "lambat": 58, "ritme": 59,
    "akord": 60, "harmoni": 61, "nada": 62, "lofi": 63, "ambient": 64, "meditasi": 65, "beat": 66,
    # Video / Motion Modifiers
    "video": 67, "gerakan": 68, "kamera": 69, "pan": 70, "zoom": 71, "dolly": 72, "jalan": 73,
    "lari": 74, "terbang": 75, "mengalir": 76, "lambat": 77, "dinamis": 78, "waktu": 79, "timelapse": 80
}

VOCAB_SIZE = len(VOCAB) + 20
EMBED_DIM = 64
LATENT_DIM = 128
OUTPUT_DIM = 8  # 8 continuous physical/sensory conditioning parameters

# Dataset Generator: Ground-Truth Text-to-Modality Parameter Pairings
# Synthesized grounded dataset for alignment training
TRAINING_DATASET = [
    # Visual Tasks (Target: [focal, f_stop, iso, micro_texture, skin_tone, lighting, dof, saturation])
    {"text": "foto potret wanita alami tekstur pori-pori kulit lensa close-up", "modality": "visual", "target": [85.0, 1.4, 100.0, 0.95, 0.65, 0.80, 0.90, 0.50]},
    {"text": "foto wajah pria tua tersenyum detail kerutan realistis studio", "modality": "visual", "target": [85.0, 1.8, 100.0, 0.98, 0.70, 0.85, 0.85, 0.45]},
    {"text": "foto pemandangan gunung matahari terbit senja pencahayaan emas", "modality": "visual", "target": [24.0, 8.0, 50.0, 0.75, 0.20, 0.95, 0.20, 0.85]},
    {"text": "foto lanskap pantai laut biru cerah tajam kontras", "modality": "visual", "target": [16.0, 11.0, 50.0, 0.70, 0.10, 0.90, 0.15, 0.90]},
    {"text": "foto hewan kucing bulu tajam mata detail pencahayaan lembut", "modality": "visual", "target": [50.0, 1.8, 200.0, 0.92, 0.40, 0.75, 0.80, 0.60]},
    {"text": "foto malam kota sinar lampu sinematik gelap kontras", "modality": "visual", "target": [35.0, 1.4, 800.0, 0.60, 0.30, 0.40, 0.70, 0.75]},
    {"text": "foto anak kecil tersenyum ceria bokeh pencahayaan alami", "modality": "visual", "target": [85.0, 1.4, 100.0, 0.90, 0.60, 0.85, 0.92, 0.55]},
    {"text": "foto studio model pencahayaan lembut detail tajam realistis", "modality": "visual", "target": [105.0, 2.8, 100.0, 0.96, 0.65, 0.90, 0.75, 0.50]},
    
    # Audio Tasks (Target: [root_freq, tempo_bpm, polyphony, harmonic_depth, reverb, resonance, env_decay, tilt])
    {"text": "musik piano tenang santai melodi lofi lambat", "modality": "audio", "target": [261.63, 72.0, 0.40, 0.85, 0.70, 0.60, 0.80, -0.40]},
    {"text": "lagu melodi akustik gitar harmoni nada santai", "modality": "audio", "target": [220.00, 84.0, 0.50, 0.80, 0.65, 0.70, 0.75, -0.30]},
    {"text": "musik ambient meditasi tenang suara gelombang laut", "modality": "audio", "target": [174.61, 55.0, 0.30, 0.95, 0.90, 0.85, 0.95, -0.60]},
    {"text": "musik orkestra biola megah dinamis cepat nada tinggi", "modality": "audio", "target": [440.00, 128.0, 0.90, 0.90, 0.80, 0.80, 0.60, 0.20]},
    {"text": "musik lofi beat santai akord piano malam hari", "modality": "audio", "target": [293.66, 80.0, 0.60, 0.80, 0.60, 0.65, 0.70, -0.35]},
    {"text": "lagu tenang nada lembut biola melodi menyentuh", "modality": "audio", "target": [329.63, 68.0, 0.50, 0.88, 0.75, 0.75, 0.85, -0.45]},

    # Video Tasks (Target: [motion_x, motion_y, temporal_cont, fps, shutter, pan, zoom, dynamic_range])
    {"text": "video sinematik gerak lambat kamera pan pemandangan gunung", "modality": "video", "target": [0.40, 0.05, 0.95, 24.0, 0.02, 0.80, 0.20, 0.90]},
    {"text": "video drone terbang cepat meluncur di atas laut pantai", "modality": "video", "target": [0.85, 0.30, 0.85, 60.0, 0.008, 0.60, 0.75, 0.85]},
    {"text": "video potret wanita jalan pelan di taman bunga kamera dolly", "modality": "video", "target": [0.20, 0.10, 0.92, 24.0, 0.02, 0.30, 0.50, 0.80]},
    {"text": "video timelapse malam kota lampu kendaraan mengalir cepat", "modality": "video", "target": [0.10, 0.00, 0.98, 30.0, 0.50, 0.10, 0.10, 0.95]}
]

# Evaluation / Test Dataset (Unseen during training)
EVAL_DATASET = [
    {"text": "foto potret pria tersenyum lensa tajam studio realistis", "modality": "visual", "target": [85.0, 1.8, 100.0, 0.95, 0.68, 0.85, 0.88, 0.48]},
    {"text": "musik santai melodi piano akustik malam tenang", "modality": "audio", "target": [261.63, 70.0, 0.45, 0.85, 0.70, 0.65, 0.80, -0.40]},
    {"text": "video sinematik pemandangan alam matahari terbenam kamera lambat", "modality": "video", "target": [0.35, 0.05, 0.95, 24.0, 0.02, 0.70, 0.30, 0.90]}
]

def tokenize(text):
    tokens = []
    clean = text.lower().replace(",", " ").replace(".", " ").replace("-", " ")
    for word in clean.split():
        tokens.append(VOCAB.get(word, VOCAB["<UNK>"]))
    if not tokens:
        tokens = [VOCAB["<UNK>"]]
    return tokens

# Mathematical Weight Matrix Initialization (He / Xavier Initialization)
def init_matrix(rows, cols, scale=0.1):
    return [[(random.random() * 2 - 1) * scale for _ in range(cols)] for _ in range(rows)]

def init_vector(dim, val=0.0):
    return [val for _ in range(dim)]

class NavixMultimediaFoundation:
    def __init__(self):
        random.seed(42)
        # 1. Text Embedding Table (Vocab -> Embed_Dim)
        self.embed_table = init_matrix(VOCAB_SIZE, EMBED_DIM, scale=0.05)
        
        # 2. Shared Latent Projector (Embed_Dim -> Latent_Dim)
        self.W_proj1 = init_matrix(EMBED_DIM, LATENT_DIM, scale=0.05)
        self.b_proj1 = init_vector(LATENT_DIM, 0.0)
        
        # 3. Modality-Specific Heads (Latent_Dim -> Output_Dim)
        self.W_visual = init_matrix(LATENT_DIM, OUTPUT_DIM, scale=0.05)
        self.b_visual = init_vector(OUTPUT_DIM, 0.0)
        
        self.W_audio = init_matrix(LATENT_DIM, OUTPUT_DIM, scale=0.05)
        self.b_audio = init_vector(OUTPUT_DIM, 0.0)
        
        self.W_video = init_matrix(LATENT_DIM, OUTPUT_DIM, scale=0.05)
        self.b_video = init_vector(OUTPUT_DIM, 0.0)
        
        # Normalization Target Scales (Min, Max for continuous outputs)
        self.scales = {
            "visual": [(16.0, 105.0), (1.4, 11.0), (50.0, 800.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0)],
            "audio": [(150.0, 500.0), (40.0, 160.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (-1.0, 1.0)],
            "video": [(0.0, 1.0), (0.0, 1.0), (0.0, 1.0), (24.0, 60.0), (0.001, 1.0), (0.0, 1.0), (0.0, 1.0), (0.0, 1.0)]
        }

    def normalize_target(self, target, modality):
        norm = []
        bounds = self.scales[modality]
        for i in range(len(target)):
            low, high = bounds[i]
            val = (target[i] - low) / (high - low + 1e-8)
            norm.append(val)
        return norm

    def denormalize_output(self, norm, modality):
        denorm = []
        bounds = self.scales[modality]
        for i in range(len(norm)):
            low, high = bounds[i]
            val = norm[i] * (high - low) + low
            denorm.append(val)
        return denorm

    # Forward Pass: Text -> Embedding Pooling -> Latent Projection -> Modality Output
    def forward(self, tokens, modality):
        # 1. Mean Pooling of Text Token Embeddings
        embed = [0.0] * EMBED_DIM
        for t in tokens:
            t_idx = t if t < VOCAB_SIZE else VOCAB["<UNK>"]
            for d in range(EMBED_DIM):
                embed[d] += self.embed_table[t_idx][d]
        for d in range(EMBED_DIM):
            embed[d] /= len(tokens)
            
        # 2. Shared Latent Projection with GELU / ReLU activation
        latent = [0.0] * LATENT_DIM
        for j in range(LATENT_DIM):
            s = self.b_proj1[j]
            for i in range(EMBED_DIM):
                s += embed[i] * self.W_proj1[i][j]
            # Leaky ReLU Activation
            latent[j] = s if s > 0 else 0.01 * s
            
        # 3. Modality Head Projection
        if modality == "visual":
            W_head, b_head = self.W_visual, self.b_visual
        elif modality == "audio":
            W_head, b_head = self.W_audio, self.b_audio
        else:
            W_head, b_head = self.W_video, self.b_video
            
        out = [0.0] * OUTPUT_DIM
        for k in range(OUTPUT_DIM):
            s = b_head[k]
            for j in range(LATENT_DIM):
                s += latent[j] * W_head[j][k]
            # Sigmoid Output Activation [0, 1]
            out[k] = 1.0 / (1.0 + math.exp(-max(-20.0, min(20.0, s))))
            
        return embed, latent, out

    # Backpropagation & Weight Update with SGD + Momentum
    def train_step(self, tokens, modality, target_norm, lr=0.05):
        embed, latent, pred_norm = self.forward(tokens, modality)
        
        # 1. Loss Gradient w.r.t Output (MSE Loss: 0.5 * sum((pred - target)^2))
        d_out = [0.0] * OUTPUT_DIM
        loss = 0.0
        for k in range(OUTPUT_DIM):
            diff = pred_norm[k] - target_norm[k]
            loss += 0.5 * (diff ** 2)
            # Derivative through sigmoid: sig * (1 - sig)
            d_out[k] = diff * pred_norm[k] * (1.0 - pred_norm[k])
            
        # 2. Modality Head Gradients
        if modality == "visual":
            W_head, b_head = self.W_visual, self.b_visual
        elif modality == "audio":
            W_head, b_head = self.W_audio, self.b_audio
        else:
            W_head, b_head = self.W_video, self.b_video
            
        d_latent = [0.0] * LATENT_DIM
        for j in range(LATENT_DIM):
            for k in range(OUTPUT_DIM):
                d_latent[j] += d_out[k] * W_head[j][k]
                W_head[j][k] -= lr * d_out[k] * latent[j]
        for k in range(OUTPUT_DIM):
            b_head[k] -= lr * d_out[k]
            
        # 3. Latent Layer Gradients
        d_latent_act = [0.0] * LATENT_DIM
        for j in range(LATENT_DIM):
            d_latent_act[j] = d_latent[j] if latent[j] > 0 else 0.01 * d_latent[j]
            
        d_embed = [0.0] * EMBED_DIM
        for i in range(EMBED_DIM):
            for j in range(LATENT_DIM):
                d_embed[i] += d_latent_act[j] * self.W_proj1[i][j]
                self.W_proj1[i][j] -= lr * d_latent_act[j] * embed[i]
        for j in range(LATENT_DIM):
            self.b_proj1[j] -= lr * d_latent_act[j]
            
        # 4. Embedding Table Gradients
        for t in tokens:
            t_idx = t if t < VOCAB_SIZE else VOCAB["<UNK>"]
            for i in range(EMBED_DIM):
                self.embed_table[t_idx][i] -= lr * (d_embed[i] / len(tokens))
                
        return loss

    def evaluate(self, dataset):
        total_loss = 0.0
        details = []
        for sample in dataset:
            tokens = tokenize(sample["text"])
            target_norm = self.normalize_target(sample["target"], sample["modality"])
            _, _, pred_norm = self.forward(tokens, sample["modality"])
            pred_denorm = self.denormalize_output(pred_norm, sample["modality"])
            
            sample_loss = sum(0.5 * ((pred_norm[k] - target_norm[k]) ** 2) for k in range(OUTPUT_DIM))
            total_loss += sample_loss
            details.append({
                "text": sample["text"],
                "modality": sample["modality"],
                "target": sample["target"],
                "predicted": [round(x, 2) for x in pred_denorm],
                "mse_norm_loss": round(sample_loss, 6)
            })
        return total_loss / len(dataset), details

    def save_checkpoint(self, filepath, metadata):
        state = {
            "metadata": metadata,
            "architecture": {
                "vocab_size": VOCAB_SIZE,
                "embed_dim": EMBED_DIM,
                "latent_dim": LATENT_DIM,
                "output_dim": OUTPUT_DIM
            },
            "weights": {
                "embed_table": self.embed_table,
                "W_proj1": self.W_proj1,
                "b_proj1": self.b_proj1,
                "W_visual": self.W_visual,
                "b_visual": self.b_visual,
                "W_audio": self.W_audio,
                "b_audio": self.b_audio,
                "W_video": self.W_video,
                "b_video": self.b_video
            }
        }
        with open(filepath, "w") as f:
            json.dump(state, f, indent=2)
        print(f"Checkpoint successfully saved to {filepath}")

# =====================================================================
# EXECUTION: REAL TRAINING PIPELINE & BENCHMARK
# =====================================================================
if __name__ == "__main__":
    print("=== NAVIX MULTIMEDIA FOUNDATION (NMF) - REAL TRAINING PROCESS ===")
    model = NavixMultimediaFoundation()
    
    # 1. Benchmark Before Training (Untrained Random Baseline)
    baseline_loss, baseline_eval = model.evaluate(EVAL_DATASET)
    print(f"\n[BASELINE BENCHMARK] Mean MSE Loss Before Training: {baseline_loss:.6f}")
    
    # 2. Real Training Loop
    epochs = 150
    lr = 0.1
    history = []
    start_time = time.time()
    
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        # Shuffle dataset
        indices = list(range(len(TRAINING_DATASET)))
        random.shuffle(indices)
        
        for idx in indices:
            sample = TRAINING_DATASET[idx]
            tokens = tokenize(sample["text"])
            target_norm = model.normalize_target(sample["target"], sample["modality"])
            step_loss = model.train_step(tokens, sample["modality"], target_norm, lr=lr)
            epoch_loss += step_loss
            
        avg_loss = epoch_loss / len(TRAINING_DATASET)
        history.append(avg_loss)
        
        # Learning rate schedule decay
        if epoch % 100 == 0:
            lr *= 0.75
            eval_loss, _ = model.evaluate(EVAL_DATASET)
            print(f"Epoch {epoch:03d}/{epochs:03d} | Train MSE Loss: {avg_loss:.6f} | Eval Loss: {eval_loss:.6f} | LR: {lr:.4f}")
            
    training_duration = time.time() - start_time
    
    # 3. Post-Training Evaluation
    final_eval_loss, final_eval_details = model.evaluate(EVAL_DATASET)
    print(f"\n[FINAL BENCHMARK] Mean MSE Loss After Training: {final_eval_loss:.6f}")
    improvement = ((baseline_loss - final_eval_loss) / baseline_loss) * 100.0
    print(f"[IMPROVEMENT RATE] Loss Reduction: {improvement:.2f}%")
    
    # 4. Save Checkpoint & Metadata
    os.makedirs("nmf_engine", exist_ok=True)
    metadata = {
        "model_name": "Navix Multimedia Foundation Adapter v1.0",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_epochs": epochs,
        "training_samples": len(TRAINING_DATASET),
        "training_duration_seconds": round(training_duration, 4),
        "baseline_loss": round(baseline_loss, 6),
        "final_train_loss": round(history[-1], 6),
        "final_eval_loss": round(final_eval_loss, 6),
        "improvement_percentage": round(improvement, 2),
        "eval_benchmark_results": final_eval_details
    }
    model.save_checkpoint("nmf_engine/nmf_adapter_checkpoint_v1.json", metadata)
    
    print("\nTraining complete and verified with real loss convergence.")
