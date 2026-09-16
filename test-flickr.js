fetch("https://loremflickr.com/1024/768/dog?random=1", { redirect: 'follow' })
  .then(res => console.log(res.url))
  .catch(err => console.error(err));
