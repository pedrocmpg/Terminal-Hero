import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SAVE_DIR = join(homedir(), ".terminal-hero");
const SAVE_PATH = join(SAVE_DIR, "save.json");

export function readSaveFile(): unknown | null {
    if (!existsSync(SAVE_PATH)) {
        return null;
    }
    const raw = readFileSync(SAVE_PATH, "utf-8");
    return JSON.parse(raw);
}

export function writeSaveFile(state: unknown): void {
    if (!existsSync(SAVE_DIR)) {
        mkdirSync(SAVE_DIR, { recursive: true });
    }
    writeFileSync(SAVE_PATH, JSON.stringify(state, null, 2), "utf-8");
}
