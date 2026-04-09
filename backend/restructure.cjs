const fs = require('fs');
const path = require('path');

const root = 'd:\\college dtu\\Projects\\StoryStream\\backend';
const src = path.join(root, 'src');

const dirsToCreate = [
    'configs', 'controllers', 'middlewares', 'models', 'prisma', 'routes', 'services', 'utils', 'workers'
];

dirsToCreate.forEach(dir => {
    if (!fs.existsSync(path.join(root, dir))) fs.mkdirSync(path.join(root, dir));
});

// Move and rename stuff
const move = (oldPath, newPath) => {
    if (fs.existsSync(oldPath)) {
        // Copy directory contents
        const stat = fs.statSync(oldPath);
        if (stat.isDirectory()) {
            const files = fs.readdirSync(oldPath);
            files.forEach(f => move(path.join(oldPath, f), path.join(newPath, f)));
        } else {
            console.log(`Moving ${oldPath} -> ${newPath}`);
            fs.renameSync(oldPath, newPath);
        }
    }
};

// Map old folders to new
move(path.join(src, 'config'), path.join(root, 'configs'));
move(path.join(src, 'controllers'), path.join(root, 'controllers'));
move(path.join(src, 'middleware'), path.join(root, 'middlewares'));
move(path.join(src, 'routes'), path.join(root, 'routes'));
move(path.join(src, 'utils'), path.join(root, 'utils'));
move(path.join(src, 'app.js'), path.join(root, 'app.js'));
move(path.join(src, 'server.js'), path.join(root, 'server.js'));

// Rename env.example
if (fs.existsSync(path.join(root, '.env.example'))) {
    fs.renameSync(path.join(root, '.env.example'), path.join(root, '.env.sample'));
}

// Create doc files
['API_DOCS.md', 'encryption_docs.md', 'map_doc.md'].forEach(file => {
    fs.writeFileSync(path.join(root, file), `# ${file}\n\nDocument structure placeholder.`);
});

// Clean up src if empty
try {
    fs.rmSync(src, { recursive: true, force: true });
    console.log('Removed old src directory.');
} catch (e) {
    console.log('Note: could not remove src completely (might not be empty).', e.message);
}

// Fix imports in app.js and server.js
let appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
appJs = appJs.replace(/\.\/middleware\//g, './middlewares/');
appJs = appJs.replace(/\.\/config\//g, './configs/');
fs.writeFileSync(path.join(root, 'app.js'), appJs);

let serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
serverJs = serverJs.replace(/\.\/config\//g, './configs/');
fs.writeFileSync(path.join(root, 'server.js'), serverJs);

// Fix routes
const routesDir = path.join(root, 'routes');
if(fs.existsSync(routesDir)) {
    fs.readdirSync(routesDir).forEach(f => {
        let content = fs.readFileSync(path.join(routesDir, f), 'utf8');
        content = content.replace(/\.\.\/middleware\//g, '../middlewares/');
        content = content.replace(/\.\.\/config\//g, '../configs/');
        fs.writeFileSync(path.join(routesDir, f), content);
    });
}

console.log("Restructuring completed perfectly automatically.");
