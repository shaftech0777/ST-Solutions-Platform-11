const fs = require('fs');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('src', function(err, results) {
  if (err) throw err;
  results.filter(f => f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s*\{\s*,\s*/g, 'import { ');
    content = content.replace(/,\s*\}/g, ' }');
    content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '');
    fs.writeFileSync(file, content);
  });
  console.log("Fixed imports");
});
