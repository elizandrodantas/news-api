"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueServicePattern = void 0;
const fastq_1 = __importDefault(require("fastq"));
const QueueServicePattern = (work) => fastq_1.default.promise(work, 2);
exports.QueueServicePattern = QueueServicePattern;
