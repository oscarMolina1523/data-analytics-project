// deps.js
export const markdownDeps = [
    {
        type: 'style',
        href: 'https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.css',
        condition: () => !!window.Prism // opcional: condición más precisa abajo
    },
    {
        type: 'script',
        src: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
        condition: () => typeof marked !== 'undefined' && marked.parse
    },
    {
        type: 'script',
        src: 'https://cdn.jsdelivr.net/npm/prismjs/prism.js',
        condition: () => typeof Prism !== 'undefined' && Prism.highlightAll
    },
    // Plugins opcionales:
    // {
    //     type: 'script',
    //     src: 'https://cdn.jsdelivr.net/npm/prismjs/components/prism-javascript.min.js',
    //     condition: () => Prism?.languages?.javascript
    // }
];