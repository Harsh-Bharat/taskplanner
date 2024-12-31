const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const methodOverride = require('method-override');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use method-override to handle HTTP methods from forms
app.use(methodOverride('_method'));

app.get('/', function (req, res) {
  fs.readdir('./files', function (err, files) {
    if (err) {
      return res.status(500).send("Error reading files.");
    }

    // Read each file and gather name and content
    const fileReadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'files', file);
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({ name: file, content: data });
          }
        });
      });
    });

    // Wait for all file content to be read
    Promise.all(fileReadPromises)
      .then((fileData) => {
        res.render("index.ejs", { props: fileData }); // Send file data to the template
      })
      .catch((err) => {
        console.error("Error reading file contents:", err);
        res.status(500).send("Error reading file contents.");
      });
  });
});
app.get('/editkro', (req, res) => {
  res.render('edit'); // Render the 'edit' EJS file
});

// Route to handle file renaming
app.post('/edit', (req, res) => {
  const oldFileName = `${req.body.oldFileName}.txt`;
  const newFileName = `${req.body.newFileName}.txt`;

  const oldPath = path.join(__dirname, 'files', oldFileName);
  const newPath = path.join(__dirname, 'files', newFileName);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).send('Error renaming file.');
    }
    console.log(`File renamed from ${oldFileName} to ${newFileName}`);
    res.redirect('/'); // Redirect to the home page after renaming
  });
});
app.post('/create', function (req, res) {
  const fileName = `${req.body.kuchname}`; // Add .txt to the filename
  const filePath = path.join(__dirname, 'files', fileName); // Full path for the file

  fs.writeFile(filePath, `${req.body.postholder}`, function (err) {
    if (err) {
      console.log("Error saving file:", err);
      res.status(500).send("Failed to create the file.");
    } else {
      console.log("File written successfully");
      res.redirect('/'); // Redirect to home after file creation
    }
  });
});

app.delete('/delete', function (req, res) {
  const fileName = `${req.body.buttonh}`; // Get filename from the form
  const filePath = path.join(__dirname, 'files', fileName); // Full path for the file

  fs.unlink(filePath, function (err) {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log("File not found:", fileName);
        return res.status(404).send("File not found.");
      } else {
        console.log("Error deleting file:", err);
        return res.status(500).send("Failed to delete the file.");
      }
    } else {
      console.log("File deleted successfully:", fileName);
      res.redirect('/'); // Redirect to home after file deletion
    }
  });
});
 app.use((req,res) => {
  res.status(404).render("404");
  });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
