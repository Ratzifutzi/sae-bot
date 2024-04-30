"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getFilesRecursively(rootPath) {
    let files = [];
    function walkSync(currentPath) {
        const entries = fs_1.default.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.endsWith(".ts"))
                continue;
            const entryPath = path_1.default.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                walkSync(entryPath);
            }
            else {
                files.push(entryPath);
            }
        }
    }
    walkSync(rootPath);
    return files;
}
exports.default = getFilesRecursively;
