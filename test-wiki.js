fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=elephant&gsrlimit=5&piprop=original")
  .then(r => r.json())
  .then(d => {
    Object.values(d.query.pages).forEach(p => {
      if (p.original) console.log(p.original.source);
    });
  });
