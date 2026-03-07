// import { http, HttpResponse } from 'msw';

// export const authHandlers = [
//   http.post('https://softplant9.co.kr/spa/api/v1/login', async ({ request }) => {
//     const requestJson = (await request.json()) as { in_id: string; in_password: string };
//     if (requestJson.in_id === 'test1' && requestJson.in_password === '1234!') {
//       return HttpResponse.json({
//         success: true,
//         msg: 'token create',
//         token: 'token',
//         id: 'test1',
//         is_admin: 'N',
//         user_nm: '테스트아이디',
//         phone: '01000000000',
//       });
//     }
//   }),
// ];
