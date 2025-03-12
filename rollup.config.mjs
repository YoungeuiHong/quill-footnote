import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/quill-footnote.esm.js",
                format: "esm",
                sourcemap: true,
            },
            {
                file: "dist/quill-footnote.cjs.js",
                format: "cjs",
                sourcemap: true,
            },
        ],
        external: ["quill"],
        plugins: [
            typescript({
                declaration: true,
                declarationDir: "dist",
                rootDir: "src",
            }),
            terser(),

            copy({
                targets: [
                    { src: "src/styles/quill-footnote.css", dest: "dist" },
                ],
            }),
        ],
    },
];
