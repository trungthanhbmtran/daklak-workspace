fetch("http://localhost:8080/api/v1/admin/categories?group=UNIT_TYPE_CATEGORY")
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
