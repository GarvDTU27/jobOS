const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('app/api', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('params.id') || content.includes('params.eventId') || content.includes('params.noteId') || content.includes('params.tagId')) {
      content = content.replace(/params\.id/g, '(await params).id');
      content = content.replace(/params\.eventId/g, '(await params).eventId');
      content = content.replace(/params\.noteId/g, '(await params).noteId');
      content = content.replace(/params\.tagId/g, '(await params).tagId');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
