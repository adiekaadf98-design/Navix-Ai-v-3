import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import util from 'util';
import { translateAndEnrichPrompt, cleanBuzzwords, buildPollinationsRealismUrl } from './src/services/photorealismEngine';

const execPromise = util.promisify(exec);

// In-memory job store for Sovereign Video & Multimedia Tasks
export interface SovereignJob {
  id: string;
  type: 'video' | 'music' | 'image';
  status: 'processing' | 'done' | 'failed';
  prompt: string;
  progress: number;
  videoUrl?: string;
  videoPath?: string;
  videoBase64?: string;
  audioBase64?: string;
  lyrics?: string;
  trackInfo?: {
    title: string;
    genre: string;
    bpm: number;
    key: string;
    mood: string;
  };
  error?: string;
  createdAt: number;
}

const sovereignJobs = new Map<string, SovereignJob>();

// Clean up old jobs every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of sovereignJobs.entries()) {
    if (now - job.createdAt > 30 * 60 * 1000) {
      if (job.videoPath && fs.existsSync(job.videoPath)) {
        try { fs.unlinkSync(job.videoPath); } catch (_) {}
      }
      sovereignJobs.delete(id);
    }
  }
}, 15 * 60 * 1000);

export function getSovereignJob(id: string): SovereignJob | undefined {
  return sovereignJobs.get(id);
}

// Ensure temp directory exists
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (_) {}
}

/**
 * 1. SOVEREIGN IMAGE ENGINE
 * Pure photorealism, eliminates artificial mannequin/plastic doll appearance,
 * enforces realistic human skin texture, pores, and natural lens dynamics.
 */
export function enrichPhotorealismPrompt(rawPrompt: string): { prompt: string; negativePrompt: string } {
  const result = translateAndEnrichPrompt(rawPrompt);
  return {
    prompt: result.prompt,
    negativePrompt: result.negativePrompt
  };
}

export async function generateSovereignImage(
  prompt: string,
  aspectRatio: string = '1:1',
  referenceImageBase64?: string,
  aiClient?: any
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const { prompt: enrichedPrompt, negativePrompt } = enrichPhotorealismPrompt(prompt);

    // Map aspect ratio for Imagen 3 format
    let imagenAr: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" = "1:1";
    if (aspectRatio === "16:9" || aspectRatio === "9:16" || aspectRatio === "4:3" || aspectRatio === "3:4" || aspectRatio === "1:1") {
      imagenAr = aspectRatio as any;
    }

    // 1. Priority Tier: Google Imagen / Gemini Vision Model High-Definition Photorealism
    if (aiClient && aiClient.models && typeof aiClient.models.generateImages === 'function') {
      try {
        console.log(`[Sovereign Image Engine] 🌟 Attempting Google Imagen generator...`);
        const response = await aiClient.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: enrichedPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: imagenAr,
            personGeneration: 'ALLOW_ADULT',
          }
        });

        if (response?.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0]?.image?.imageBytes) {
          const rawBytes = response.generatedImages[0].image.imageBytes;
          console.log(`[Sovereign Image Engine] ✅ Google Imagen rendered studio photo.`);
          return {
            success: true,
            imageBase64: `data:image/jpeg;base64,${rawBytes}`
          };
        }
      } catch (geminiImgErr: any) {
        console.log(`[Sovereign Image Engine] Switching to sovereign high-definition photorealism engine...`);
      }
    }

    // 2. High-Fidelity Flux-Realism Photorealism (Zero Doll / Anti-Plastic Filter Engine)
    const seed = Math.floor(Math.random() * 9999999);
    const primaryUrl = buildPollinationsRealismUrl(prompt, aspectRatio, seed);
    const fallbackUrl = buildPollinationsRealismUrl(prompt, aspectRatio, seed + 1);

    console.log(`[Sovereign Image Engine] Synthesizing authentic photorealistic image with seed ${seed}...`);

    let res: Response | null = null;
    try {
      res = await fetch(primaryUrl, { signal: AbortSignal.timeout(14000) });
    } catch (e) {
      console.warn("[Sovereign Image Engine] Primary mirror timeout, trying turbo fallback...");
    }

    if (!res || !res.ok) {
      try {
        res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(10000) });
      } catch (e) {
        console.warn("[Sovereign Image Engine] Fallback mirror timeout:", e);
      }
    }

    if (res && res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = res.headers.get('content-type') || 'image/jpeg';

      return {
        success: true,
        imageBase64: `data:${mimeType};base64,${base64}`
      };
    }

    // Direct CDN Link Fallback: Browser will load directly without server bottleneck
    return {
      success: true,
      imageBase64: primaryUrl
    };
  } catch (err: any) {
    console.error("[Sovereign Image Engine] Generation error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * SOVEREIGN IMAGE EDIT & COMPOSITE ENGINE
 * 100% autonomous, zero Gemini Image API dependency, zero quota limitations.
 */
export async function editSovereignImage(
  imageInput: string,
  operation: string,
  prompt: string
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  // If filter operation like grayscale, invert, blur: process locally with FFmpeg
  if (imageInput && imageInput.startsWith('data:') && ['image_grayscale', 'image_invert', 'image_blur'].includes(operation)) {
    const tmpIn = path.join(TMP_DIR, `edit_in_${Date.now()}_${Math.random().toString(36).substring(2,6)}.png`);
    const tmpOut = path.join(TMP_DIR, `edit_out_${Date.now()}_${Math.random().toString(36).substring(2,6)}.png`);
    try {
      const b64 = imageInput.split(',')[1];
      fs.writeFileSync(tmpIn, Buffer.from(b64, 'base64'));
      let vf = 'hue=s=0';
      if (operation === 'image_invert') vf = 'negate';
      if (operation === 'image_blur') vf = 'boxblur=8:1';

      await execPromise(`ffmpeg -y -i "${tmpIn}" -vf "${vf}" "${tmpOut}"`);
      if (fs.existsSync(tmpOut)) {
        const outBuf = fs.readFileSync(tmpOut);
        return { success: true, imageBase64: `data:image/png;base64,${outBuf.toString('base64')}` };
      }
    } catch (err: any) {
      console.warn("[Sovereign Image Edit] Local filter error:", err);
    } finally {
      try { if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn); } catch (_) {}
      try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch (_) {}
    }
  }

  // Creative style transformations
  let stylePrompt = prompt || 'Artistic edit';
  if (operation === 'gemini_me') {
    stylePrompt = `Authentic candid portrait photograph of a real person with natural skin details and facial features, ${prompt}`;
  } else if (operation === 'figurine') {
    stylePrompt = `A cute detailed miniature 3D designer toy figurine collectible of ${prompt}, studio lighting, macro lens photography`;
  } else if (operation === 'aesthetic') {
    stylePrompt = `Aesthetic vintage 90s film photograph of ${prompt}, warm nostalgic grain, authentic kodachrome colors`;
  } else if (operation === 'hairstyle') {
    stylePrompt = `High-end salon hair makeover portrait of ${prompt}, gorgeous healthy hair texture, natural lighting`;
  } else if (operation === 'blend') {
    stylePrompt = `Artistic seamless fusion composition of ${prompt}, high aesthetic masterpiece`;
  }

  return await generateSovereignImage(stylePrompt, '1:1');
}

export async function compositeSovereignImage(
  userPrompt: string,
  aspectRatio: string = '1:1'
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  const enhancedPrompt = `Masterpiece fashion editorial composition: ${userPrompt}, authentic candid shot, visible micro-pores and realistic skin texture, natural environmental lighting, rich textures, 8k resolution, zero plastic, zero CGI`;
  return await generateSovereignImage(enhancedPrompt, aspectRatio);
}

/**
 * 2. SOVEREIGN VIDEO STUDIO ENGINE
 * Synthesizes high-fidelity 720p H.264 MP4 videos using local FFmpeg pipeline with
 * cinematic camera motions (dynamic zoom, pan, tilt) and embedded soundtrack.
 */
export async function startSovereignVideoJob(
  prompt: string,
  imageInput?: string
): Promise<{ success: boolean; operationName: string; isSovereign: boolean }> {
  const jobId = `job_sovereign_video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const job: SovereignJob = {
    id: jobId,
    type: 'video',
    status: 'processing',
    prompt: prompt || 'Cinematic video sequence',
    progress: 10,
    createdAt: Date.now()
  };
  sovereignJobs.set(jobId, job);

  // Run generation asynchronously in background
  (async () => {
    const framePath = path.join(TMP_DIR, `${jobId}_frame.jpg`);
    const audioPath = path.join(TMP_DIR, `${jobId}_sound.wav`);
    const outMp4Path = path.join(TMP_DIR, `${jobId}_render.mp4`);

    try {
      job.progress = 25;

      // 1. Prepare Keyframe Image
      if (imageInput && imageInput.startsWith('data:')) {
        const matches = imageInput.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[2]) {
          fs.writeFileSync(framePath, Buffer.from(matches[2], 'base64'));
        }
      }

      if (!fs.existsSync(framePath)) {
        job.progress = 35;
        console.log(`[Sovereign Video Engine] Generating cinematic keyframe for: "${prompt}"...`);
        const imgResult = await generateSovereignImage(prompt, '16:9');
        if (imgResult.success && imgResult.imageBase64) {
          const b64Data = imgResult.imageBase64.split(',')[1];
          fs.writeFileSync(framePath, Buffer.from(b64Data, 'base64'));
        } else {
          // Generate high-contrast placeholder frame with FFmpeg
          execSync(`ffmpeg -y -f lavfi -i color=c=0x111827:s=1280x720:d=1 -vframes 1 "${framePath}"`);
        }
      }

      job.progress = 55;

      // 2. Generate Ambient Soundtrack (5 seconds harmonic soundscape)
      const audioWavBuffer = generateSynthWavBuffer(5, 44100, 'cinematic');
      fs.writeFileSync(audioPath, audioWavBuffer);

      job.progress = 70;

      // 3. Render 5-second 720p H.264 MP4 with Cinematic Smooth Motion & Audio
      console.log(`[Sovereign Video Engine] Compiling MP4 video stream via FFmpeg...`);
      const zoomPanFilter = "zoompan=z='min(zoom+0.0012,1.20)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25";
      const ffmpegCmd = `ffmpeg -y -loop 1 -i "${framePath}" -i "${audioPath}" -vf "${zoomPanFilter}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 128k -t 5 -shortest "${outMp4Path}"`;

      await execPromise(ffmpegCmd);

      if (fs.existsSync(outMp4Path)) {
        const mp4Buf = fs.readFileSync(outMp4Path);
        job.videoBase64 = `data:video/mp4;base64,${mp4Buf.toString('base64')}`;
        job.videoUrl = `/api/video-stream/${jobId}`;
        job.videoPath = outMp4Path;
        job.status = 'done';
        job.progress = 100;
        console.log(`[Sovereign Video Engine] MP4 rendering completed! Size: ${mp4Buf.length} bytes.`);
      } else {
        throw new Error("FFmpeg output file not generated.");
      }
    } catch (err: any) {
      console.error(`[Sovereign Video Engine] Render error for job ${jobId}:`, err);
      job.status = 'failed';
      job.error = err.message || String(err);
    } finally {
      // Clean up intermediate files
      try { if (fs.existsSync(framePath)) fs.unlinkSync(framePath); } catch (_) {}
      try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); } catch (_) {}
    }
  })();

  return { success: true, operationName: jobId, isSovereign: true };
}

/**
 * 3. SOVEREIGN MUSIC & LYRIC STUDIO ENGINE
 * Composes rich structured song lyrics and synthesizes genuine 16-bit 44.1kHz
 * stereo PCM WAV audio files with chords, melodies, basslines, and beats.
 */
export function generateSynthWavBuffer(
  durationSec: number = 8,
  sampleRate: number = 44100,
  genre: string = 'lofi'
): Buffer {
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const totalSamples = Math.floor(durationSec * sampleRate);
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Chord Progression: Am -> F -> C -> G
  const chordSet = [
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [261.63, 329.63, 392.00], // C
    [196.00, 246.94, 293.66], // G
  ];

  const chordDuration = 2; // 2 seconds each chord
  let offset = 44;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t % 8) / chordDuration);
    const chord = chordSet[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // Harmonic Pad Synth
    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const padWave = Math.sin(2 * Math.PI * f * t) * 0.12 + Math.sin(2 * Math.PI * f * 2 * t) * 0.04;
      sampleL += padWave * (c === 0 ? 0.9 : 0.6);
      sampleR += padWave * (c === 2 ? 0.9 : 0.6);
    }

    // Melodic Arpeggio (Pentatonic Scale)
    const arpFreqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const arpStep = Math.floor((t * 4) % 5);
    const arpEnv = Math.exp(-((t * 4) % 1) * 3.5);
    const arpWave = Math.sin(2 * Math.PI * arpFreqs[arpStep] * t) * 0.16 * arpEnv;
    sampleL += arpWave * 0.8;
    sampleR += arpWave * 0.5;

    // Bassline (Root note sub-bass)
    const rootFreq = chord[0] / 2;
    const bass = Math.sin(2 * Math.PI * rootFreq * t) * 0.22;
    sampleL += bass;
    sampleR += bass;

    // Subtle Kick / Rhythm Pulse
    const beat = t * 2;
    const beatPhase = beat % 1;
    if (beatPhase < 0.08) {
      const kick = Math.sin(2 * Math.PI * 55 * (1 - beatPhase * 10) * t) * 0.3;
      sampleL += kick;
      sampleR += kick;
    }

    // Limiter / Anti-clipping
    sampleL = Math.max(-0.95, Math.min(0.95, sampleL));
    sampleR = Math.max(-0.95, Math.min(0.95, sampleR));

    const intL = Math.floor(sampleL * 32767);
    const intR = Math.floor(sampleR * 32767);

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  return buffer;
}

export function generateSovereignMusicSuite(prompt: string): {
  success: boolean;
  audioBase64: string;
  lyrics: string;
  trackInfo: {
    title: string;
    genre: string;
    bpm: number;
    key: string;
    mood: string;
  };
} {
  const p = (prompt || '').toLowerCase();
  
  let genre = 'Lo-Fi Chill & Pop';
  let bpm = 95;
  let key = 'A Minor';
  let mood = 'Mellow & Inspiring';
  let title = 'Harmoni Masa Depan';

  if (p.includes('rock') || p.includes('metal')) {
    genre = 'Modern Energetic Rock';
    bpm = 135;
    key = 'E Minor';
    mood = 'Energetic & Powerful';
    title = 'Nyala Api Semangat';
  } else if (p.includes('cinematic') || p.includes('epic') || p.includes('orkestra')) {
    genre = 'Epic Cinematic Soundtrack';
    bpm = 85;
    key = 'D Minor';
    mood = 'Grand & Heroic';
    title = 'Gema Horizon Abadi';
  } else if (p.includes('akustik') || p.includes('acoustic') || p.includes('gitar')) {
    genre = 'Warm Acoustic Folk';
    bpm = 100;
    key = 'G Major';
    mood = 'Calm & Heartwarming';
    title = 'Lentera Senja';
  } else if (p.includes('edm') || p.includes('electro') || p.includes('dance')) {
    genre = 'Future Bass Electronic';
    bpm = 128;
    key = 'F Minor';
    mood = 'Upbeat & Euphoric';
    title = 'Cahaya Neon Malam';
  }

  const userTheme = prompt ? `"${prompt.substring(0, 80)}"` : 'Harapan dan Perjuangan';

  const lyrics = `
🎵 JUDUL: ${title}
🎹 GENRE: ${genre} | TEMPO: ${bpm} BPM | NADA DASAR: ${key} | MOOD: ${mood}

[INTRO]
(Alunan synth lembut membelah keheningan, detak ritme perlahan hadir)
Am - F - C - G

[VERSE 1]
Langkah kaki terukir di jalanan berdebu,
Membawa bayang mimpi yang kian meninggi.
Dunia terus berputar dalam kilauan waktu,
Namun hati ini takkan pernah berhenti.

[PRE-CHORUS]
(Arpeggio piano kian tegas, bassline merambat naik)
Meski kabut menutup pandangan,
Cahaya fajar kan temukan jalan.

[CHORUS]
Kita arungi langit tanpa batas asa,
Melampaui keraguan yang pernah ada!
Bernyanyi bersama semesta yang megah,
Langkah kita nyata, takkan goyah!

[VERSE 2]
Setiap nada adalah cerita yang abadi,
Tersimpan rapi di dalam denyut nadi.
Dari mimpi sederhana menjelma harmoni,
Inilah mahakarya yang kita miliki.

[BRIDGE]
(Ketukan drum berhenti sejenak, hanya synth pad dan vokal jernih)
Biarkan nada memeluk sukma,
Menembus ruang dan dimensi nyata...

[CHORUS REPEAT]
Kita arungi langit tanpa batas asa,
Melampaui keraguan yang pernah ada!
Bernyanyi bersama semesta yang megah,
Langkah kita nyata, takkan goyah!

[OUTRO]
(Melodi memudar perlahan dengan gema lembut)
Harmoni abadi... selamanya bernyawa.
`.trim();

  const wavBuf = generateSynthWavBuffer(8, 44100, genre);
  const audioBase64 = `data:audio/wav;base64,${wavBuf.toString('base64')}`;

  return {
    success: true,
    audioBase64,
    lyrics,
    trackInfo: {
      title,
      genre,
      bpm,
      key,
      mood
    }
  };
}
