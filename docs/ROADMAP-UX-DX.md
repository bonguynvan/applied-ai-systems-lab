# Kế hoạch UX & Developer Experience (DX)

Tập trung vào **trải nghiệm người dùng** và **tiện ích cho developer** khi dùng Lab làm sandbox / tích hợp API.

---

## Phase 1: UX nhanh (Quick wins)

### 1.1 Loading & empty states
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Skeleton result** | Khi đang gửi request, hiển thị skeleton thay vì chỉ spinner + text (giảm cảm giác chờ). | Cao |
| **Empty tabs** | Analytics / Iterations / Learnings: khi chưa có data, thêm icon + CTA rõ ràng (vd: "Chạy thử experiment để xem metric"). | Cao |
| **Empty history/favorites** | HistoryPanel, FavoritesPanel: empty state có icon + 1 dòng hướng dẫn. | Trung bình |

### 1.2 Copy & code blocks
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Copy code block** | Mỗi khối SQL/code trong ResultDisplay có nút "Copy" góc phải; copy xong toast "Copied". | Cao |
| **Copy to clipboard** | Đảm bảo mọi nút copy đều có toast phản hồi (đã có cho result/share). | Đã xong phần lớn |

### 1.3 Lỗi & phản hồi
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Phân loại lỗi** | Hiển thị khác nhau cho: **429** (rate limit), **budget**, **validation** (Zod), **API key / 5xx**. Có icon + gợi ý hành động (vd: "Thêm API key trong Settings"). | Cao |
| **Validation inline** | Lỗi Zod từ API: hiển thị cạnh field tương ứng (nếu form map được path → field), hoặc list bullet trong khối lỗi. | Trung bình |

### 1.4 Shortcuts & discoverability
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Shortcuts hint** | Tooltip trên nút Analyze: "Ctrl+Enter to submit". Hoặc 1 dòng nhỏ dưới form: "⌘/Ctrl + Enter: gửi". | Trung bình |
| **UserGuide** | Thêm section "Keyboard shortcuts" (Ctrl+Enter, Esc đóng modal). | Thấp |

---

## Phase 2: Developer utility (DX)

### 2.1 Gọi API từ code / CLI
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Copy as cURL** | Sau khi có result thành công: nút "Copy as cURL" tạo lệnh curl với `POST /api/experiments/:slug`, body JSON (input + model), headers (Content-Type, tùy chọn X-OpenAI-Key nếu BYOK). | Cao |
| **Copy as fetch** | Tương tự: snippet `fetch()` hoặc `axios` với URL, body, headers để dev paste vào script. | Cao |
| **API tab / panel** | Trong experiment page: tab "API" hoặc drawer "How to call" với: endpoint, method, body schema (JSON), response shape, ví dụ curl + fetch. | Cao |

### 2.2 Schema & docs
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Input schema** | Trang API hiển thị input schema (từ Zod) dạng JSON Schema hoặc bảng field (name, type, required, mô tả). | Trung bình |
| **Response shape** | Ví dụ response success/error; có thể generate từ type ExecutionResult. | Trung bình |
| **OpenAPI/Swagger** | Optional: file `openapi.yaml` hoặc route `/api/docs` mô tả POST /api/experiments/:slug (đủ để tích hợp Postman/Insomnia). | Thấp |

### 2.3 Debug & observability
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Request/Response raw** | Toggle "Show raw" trong ResultDisplay: hiển thị request body (đã gửi) + response JSON (chỉ metadata + data, có thể redact key). | Trung bình |
| **Cost breakdown** | Trong metadata: tách "Input cost" vs "Output cost" (đã có input/output tokens; chỉ cần tính $ và hiển thị 2 dòng). | Trung bình |
| **Execution ID** | Hiển thị executionId trong UI (copy được) để dev đối chiếu log/feedback. | Thấp |

### 2.4 Share & reproduce
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Share có input** | ShareableData mở rộng: thêm `input?: Record<string, any>`. Khi share, encode cả input. Trang /share: nút "Reproduce" mở experiment với form đã điền từ input. | Cao |
| **Share = repro** | Link share vừa xem kết quả vừa "Run again" với cùng input (nếu đã lưu input trong link). | Cao |

---

## Phase 3: UX bổ sung (Polish)

### 3.1 Accessibility & responsive
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **Focus & keyboard** | Modal, drawer: trap focus; đóng bằng Esc (đã có ở UserGuide). Form: tab order hợp lý. | Trung bình |
| **ARIA** | Nút loading: aria-busy; thông báo lỗi: role="alert"; form error: aria-describedby. | Trung bình |
| **Mobile** | Experiment layout 2 cột: trên mobile stack form trên / result dưới; nút Analyze cố định hoặc dễ chạm. | Trung bình |

### 3.2 Onboarding
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **First visit** | Lần đầu vào trang chủ: tooltip/highlight "Chọn một demo bên dưới" hoặc "Mở Settings để thêm API key". | Thấp |
| **Experiment lần đầu** | Trong experiment: nếu chưa từng chạy, 1 dòng nhỏ "Lần đầu? Nhấn ? để xem hướng dẫn." trỏ tới UserGuide. | Thấp |

### 3.3 Consistency
| Mục | Mô tả | Ưu tiên |
|-----|--------|---------|
| **i18n** | Đảm bảo mọi string user-facing có key EN/VI (FeedbackPanel, empty states, API tab, lỗi). | Trung bình |
| **Loading copy** | Thống nhất "Loading...", "Processing...", "Submitting..." theo ngữ cảnh và i18n. | Thấp |

---

## Thứ tự gợi ý (solo dev)

1. **Phase 1.1 + 1.2** – Skeleton, empty tabs, copy code block → cảm giác app “hoàn chỉnh” hơn.
2. **Phase 2.1** – Copy cURL/fetch + API tab → dev có thể gọi từ script/CLI ngay.
3. **Phase 2.4** – Share kèm input + Reproduce → chia sẻ và tái tạo dễ.
4. **Phase 1.3** – Phân loại lỗi rõ ràng → ít bối rối khi 429/budget/validation.
5. **Phase 2.2, 2.3** – Schema, raw request/response, cost breakdown → debug và tích hợp sâu hơn.
6. **Phase 3** – A11y, mobile, onboarding → polish khi đã ổn tính năng.

---

## Ghi chú kỹ thuật

- **Copy cURL/fetch**: Cần lưu last request (method, url, body, headers) trong state hoặc từ `lastInput` + experiment slug; build string curl/fetch từ đó.
- **Share + input**: `ShareableData` thêm field `input`; encode/decode vẫn base64url; URL có thể dài → có thể nén hoặc chỉ lưu với "Share with input" tùy chọn.
- **API tab schema**: Có thể dùng `zodToJsonSchema` (hoặc tương đương) từ `experiment.inputSchema` để hiển thị schema; response mô tả bằng TypeScript type hoặc JSON example.
- **Skeleton**: Dùng component `Skeleton` có sẵn trong `components/ui/skeleton.tsx`, layout giống ResultDisplay (metadata cards + content block).

File này có thể cập nhật khi hoàn thành từng mục hoặc khi đổi ưu tiên.
