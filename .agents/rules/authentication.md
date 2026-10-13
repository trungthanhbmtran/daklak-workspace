# Authentication Rules

- Thực hiện ở `api-gateway`.
- JWT không được nhồi nhét quá nhiều business data (như danh sách role detail, permission detail, employee info...).
- JWT chỉ chứa thông tin định danh và claims cơ bản để authentication/authorization.
- Cần thông tin động thì phải truy vấn source-of-truth (ví dụ `user-service`).
