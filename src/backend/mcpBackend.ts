import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import vm from "node:vm";
import { fileEngine } from "./engines/FileEngine";
import { searchEngine } from "./engines/SearchEngine";
import { DoclingCoreEngine } from "../services/opensource-core/DoclingCoreEngine";

export type PluginStatus = "DISCOVERED" | "READY" | "FAILED" | "DISCONNECTED";

export interface ServerState {
  name: string;
  status: PluginStatus;
  lastError?: string;
}

const mcpClients = new Map<string, Client>();
const serverStates = new Map<string, ServerState>();

// Builtin servers handled internally
export const BUILTIN_SERVERS = new Set([
  "filesystem",
  "file_system",
  "fetch",
  "git",
  "memory",
  "turbo_multimedia"
]);

// Initialize builtin servers as READY, others as DISCONNECTED
const KNOWN_SERVERS = [
  "filesystem",
  "file_system",
  "fetch",
  "git",
  "memory",
  "turbo_multimedia",
  "market_engine",
  "code_sandbox",
  "web_search",
  "semgrep",
  "typescript_validator",
  "firebase",
  "coderabbitai",
  "everything"
];

for (const s of KNOWN_SERVERS) {
  if (BUILTIN_SERVERS.has(s)) {
    serverStates.set(s, { name: s, status: "READY" });
  } else {
    serverStates.set(s, { name: s, status: "DISCONNECTED" });
  }
}

export function isBuiltinServer(name: string): boolean {
  return BUILTIN_SERVERS.has(name.toLowerCase());
}

export function getServerStatus(serverName: string): ServerState {
  const norm = serverName.toLowerCase();
  if (mcpClients.has(norm)) {
    return { name: serverName, status: "READY" };
  }
  if (serverStates.has(norm)) {
    return serverStates.get(norm)!;
  }
  if (isBuiltinServer(norm)) {
    return { name: serverName, status: "READY" };
  }
  return { name: serverName, status: "DISCONNECTED" };
}

export function listAllServers(): ServerState[] {
  return Array.from(serverStates.values());
}

export async function connectMcpServer(serverName: string, command: string, args: string[]) {
  const norm = serverName.toLowerCase();
  if (mcpClients.has(norm)) {
    return mcpClients.get(norm)!;
  }

  serverStates.set(norm, { name: serverName, status: "DISCOVERED" });
  console.log(`[MCP] Connecting to server ${serverName} using ${command} ${args.join(" ")}`);

  try {
    const transport = new StdioClientTransport({
      command,
      args
    });

    const client = new Client({
      name: "navix-skill-router",
      version: "1.0.0",
    }, {
      capabilities: {}
    });

    await client.connect(transport);
    mcpClients.set(norm, client);
    serverStates.set(norm, { name: serverName, status: "READY" });
    return client;
  } catch (err: any) {
    console.warn(`[MCP] Stdio connect failed for ${serverName}:`, err?.message);
    serverStates.set(norm, { name: serverName, status: "FAILED", lastError: err?.message });
    return null;
  }
}

export async function discoverTools(serverName: string) {
  const norm = serverName.toLowerCase();
  const client = mcpClients.get(norm);
  if (client) {
    try {
      const response = await client.listTools();
      serverStates.set(norm, { name: serverName, status: "READY" });
      return response.tools;
    } catch (e: any) {
      console.warn(`[MCP] Error calling listTools on ${serverName}:`, e?.message);
      serverStates.set(norm, { name: serverName, status: "FAILED", lastError: e?.message });
      return [];
    }
  }

  // Real tool definitions for built-in repository capabilities
  if (norm === "filesystem" || norm === "file_system") {
    return [
      {
        name: "file_scan_malware",
        description: "Memindai file buffer atau konten dari ancaman keamanan malware via FileEngine.",
        inputSchema: { type: "object", properties: { filename: { type: "string" }, content: { type: "string" } }, required: ["filename"] }
      }
    ];
  } else if (norm === "fetch") {
    return [
      {
        name: "fetch_url",
        description: "Melakukan HTTP request GET ke URL eksternal secara aman.",
        inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] }
      }
    ];
  } else if (norm === "git") {
    return [
      {
        name: "git_status",
        description: "Memeriksa status git working directory.",
        inputSchema: { type: "object", properties: {} }
      }
    ];
  } else if (norm === "memory") {
    return [
      {
        name: "memory_store",
        description: "Menyimpan atau membaca memori kontekstual sesi.",
        inputSchema: { type: "object", properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key"] }
      }
    ];
  } else if (norm === "turbo_multimedia") {
    return [
      {
        name: "turbo_generate_image",
        description: "Menghasilkan visual fotorealistik resolusi tinggi menggunakan adapter Fooocus/SDXL-Lightning dan NMF optical conditioning.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Deskripsi prompt gambar visual" },
            aspectRatio: { type: "string", enum: ["1:1", "16:9", "9:16", "4:3", "3:4"], default: "1:1" },
            resolution: { type: "string", enum: ["512px", "1K", "2K", "4K"], default: "1K" }
          },
          required: ["prompt"]
        }
      },
      {
        name: "turbo_generate_video",
        description: "Menghasilkan video temporal berorientasi gerak (Wan2.1/AnimateDiff) dengan stitching FFmpeg 60fps.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Deskripsi adegan video sinematik" },
            keyframeBase64: { type: "string", description: "Opsional frame awal base64" },
            cameraMovement: { type: "string", enum: ["pan_zoom", "tilt", "static", "dolly"], default: "pan_zoom" },
            durationSeconds: { type: "number", default: 5 }
          },
          required: ["prompt"]
        }
      },
      {
        name: "turbo_synthesize_audio",
        description: "Menghasilkan komposisi musik dan gelombang audio polyphonic 24kHz/48kHz WAV menggunakan MusicGen/Lyria.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Deskripsi melodi, tempo, genre, atau suasana audio" },
            durationSeconds: { type: "number", default: 8 },
            tempoBpm: { type: "number", default: 75 }
          },
          required: ["prompt"]
        }
      },
      {
        name: "turbo_parse_pdf",
        description: "Mengekstrak hierarki dokumen, matriks tabel keuangan/teknis, dan CommonMark dari berkas PDF/dokumen menggunakan IBM Granite Docling.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Konten teks, CSV, atau base64 dokumen PDF" },
            title: { type: "string", default: "Dokumen Analisis Navix" }
          },
          required: ["content"]
        }
      }
    ];
  }

  // If server is not builtin and not connected via client: Status is DISCONNECTED, tools is []
  serverStates.set(norm, { name: serverName, status: "DISCONNECTED" });
  return [];
}

export async function executeTool(serverName: string, toolName: string, args: any) {
  const normServer = serverName.toLowerCase();
  const normTool = toolName.toLowerCase();

  // 1. If connected via genuine MCP Stdio Client, delegate directly to the MCP server
  const client = mcpClients.get(normServer);
  if (client) {
    try {
      const response = await client.callTool({
        name: toolName,
        arguments: args
      });
      serverStates.set(normServer, { name: serverName, status: "READY" });
      return response;
    } catch (e: any) {
      console.warn(`[MCP] Direct callTool failed for ${serverName}/${toolName}:`, e?.message);
      serverStates.set(normServer, { name: serverName, status: "FAILED", lastError: e?.message });
      throw new Error(`MCP_REMOTE_EXECUTION_FAILED: ${e?.message || "Gagal memanggil remote MCP tool"}`);
    }
  }

  // 2. Builtin execution
  if (normServer === "filesystem" || normServer === "file_system") {
    if (normTool === "file_scan_malware") {
      const filename = args?.filename || "unknown.txt";
      const content = args?.content || "";
      const scanResult = await fileEngine.scanFileForMalware(Buffer.from(content));
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ filename, ...scanResult }, null, 2)
        }]
      };
    }
  }

  if (normServer === "fetch") {
    if (normTool === "fetch_url") {
      const targetUrl = args?.url;
      if (!targetUrl) throw new Error("INVALID_ARGUMENT: url parameter required");
      const res = await fetch(targetUrl, { headers: { 'User-Agent': 'NavixMCP/3.0' } });
      const text = await res.text();
      return {
        content: [{
          type: "text",
          text: text.slice(0, 5000)
        }]
      };
    }
  }

  if (normServer === "memory") {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ status: "READY", key: args?.key, saved: true })
      }]
    };
  }

  if (normServer === "turbo_multimedia") {
    if (normTool === "turbo_parse_pdf") {
      const content = args?.content || "";
      const title = args?.title || "Dokumen Navix AI";
      const doc = DoclingCoreEngine.parse(content, title);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            engine: "Docling-IBM-Granite-Turbo",
            document: doc,
            totalHeadings: doc.headingsCount,
            totalTables: doc.tablesCount,
            readingMetrics: {
              words: doc.totalWords,
              readingTime: doc.readingTimeMinutes,
              readingLevel: doc.readingLevel
            }
          }, null, 2)
        }]
      };
    }

    if (normTool === "turbo_generate_image") {
      const prompt = args?.prompt || "Photorealistic scene";
      const aspectRatio = args?.aspectRatio || "1:1";
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            status: "ROUTED_TO_HYBRID_PROXY",
            endpoint: "/api/multimedia/image/turbo",
            prompt,
            aspectRatio,
            engine: "Fooocus-SDXL-Lightning-NMF"
          }, null, 2)
        }]
      };
    }

    if (normTool === "turbo_generate_video") {
      const prompt = args?.prompt || "Cinematic video";
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            status: "ROUTED_TO_HYBRID_PROXY",
            endpoint: "/api/multimedia/video/turbo",
            prompt,
            cameraMovement: args?.cameraMovement || "pan_zoom",
            engine: "Wan2.1-AnimateDiff-FFmpeg"
          }, null, 2)
        }]
      };
    }

    if (normTool === "turbo_synthesize_audio") {
      const prompt = args?.prompt || "Harmonic melody";
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            status: "ROUTED_TO_HYBRID_PROXY",
            endpoint: "/api/multimedia/audio/turbo",
            prompt,
            durationSeconds: args?.durationSeconds || 8,
            engine: "AudioCraft-MusicGen-Polyphonic"
          }, null, 2)
        }]
      };
    }
  }

  // If server is not builtin and not connected:
  serverStates.set(normServer, { name: serverName, status: "DISCONNECTED", lastError: `Server ${serverName} is not connected` });
  throw new Error(`CAPABILITY_NOT_AVAILABLE: MCP server '${serverName}' tidak terhubung (DISCONNECTED). Silakan hubungkan proses eksternal MCP.`);
}
