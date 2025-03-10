import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/quill-footnote.esm.js",
                format: "esm",
                sourcemap: true
            },
            {
                file: "dist/quill-footnote.cjs.js",
                format: "cjs",
                sourcemap: true
            }
        ],
        external: ["quill"],
        plugins: [
            typescript({
                declaration: true,
                declarationDir: "dist",
                rootDir: "src"
            }),
            terser()
        ]
    }
];
