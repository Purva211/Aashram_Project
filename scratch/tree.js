const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'public', '.vscode', 'scratch'];

function printTree(dir, prefix = '') {
    let output = '';
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return output;
    }
    
    // Sort directories first, then files
    const stats = files.map(file => {
        try {
            return { file, stat: fs.statSync(path.join(dir, file)) };
        } catch(e) {
            return null;
        }
    }).filter(Boolean);
    
    stats.sort((a, b) => {
        if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1;
        if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1;
        return a.file.localeCompare(b.file);
    });

    const filtered = stats.filter(f => !IGNORE_DIRS.includes(f.file));

    filtered.forEach((f, index) => {
        const isLast = index === filtered.length - 1;
        output += prefix + (isLast ? '+-- ' : '|-- ') + f.file + '\n';
        if (f.stat.isDirectory()) {
            output += printTree(path.join(dir, f.file), prefix + (isLast ? '    ' : '|   '));
        }
    });
    return output;
}

const root = path.resolve('.');
fs.writeFileSync('scratch/tree_utf8.txt', printTree(root), 'utf8');
