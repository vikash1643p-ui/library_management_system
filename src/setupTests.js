
import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
