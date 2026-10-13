# Authorization Rules

- Việc cấp quyền, verify quyền hạn phải thực hiện ở Backend (Gateway hoặc Service).
- Frontend KHÔNG được tự ý đưa ra quyết định authorization mang tính quyết định.
- Backend trả về kết quả (allowed, denied) và frontend tuân theo.
