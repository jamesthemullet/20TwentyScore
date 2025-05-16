// import NextAuth from 'next-auth';
// import authHandler from './[...nextauth]';

// jest.mock('next-auth', () => jest.fn());

// describe('Nextauth', () => {
//   const OLD_ENV = process.env;

//   it('should call NextAuth with correct options', async () => {
//     process.env = {
//       ...OLD_ENV,
//       NODE_ENV: 'test',
//       GITHUB_ID: 'mock-github-id',
//       GITHUB_SECRET: 'mock-github-secret',
//       FACEBOOK_ID: 'mock-facebook-id',
//       FACEBOOK_SECRET: 'mock-facebook-secret',
//       GOOGLE_ID: 'mock-google-id',
//       GOOGLE_SECRET: 'mock-google-secret',
//       SECRET: 'mock-secret'
//     };
//     const req = {} as any;
//     const res = {} as any;
//     await authHandler(req, res);
//     expect(NextAuth).toHaveBeenCalledWith(
//       req,
//       res,
//       expect.objectContaining({
//         providers: expect.arrayContaining([
//           expect.objectContaining({
//             id: 'github',
//             options: {
//               clientId: 'mock-github-id',
//               clientSecret: 'mock-github-secret'
//             }
//           }),
//           expect.objectContaining({
//             id: 'facebook',
//             options: {
//               clientId: 'mock-facebook-id',
//               clientSecret: 'mock-facebook-secret'
//             }
//           }),
//           expect.objectContaining({
//             id: 'google',
//             options: {
//               clientId: 'mock-google-id',
//               clientSecret: 'mock-google-secret'
//             }
//           })
//         ])
//       })
//     );
//   });

//   it('should call NextAuth when env vars are missing', async () => {
//     process.env = {
//       ...OLD_ENV,
//       NODE_ENV: 'test',
//       SECRET: 'mock-secret'
//     };
//     delete process.env.GITHUB_ID;
//     delete process.env.GITHUB_SECRET;
//     delete process.env.FACEBOOK_ID;
//     delete process.env.FACEBOOK_SECRET;
//     delete process.env.GOOGLE_ID;
//     delete process.env.GOOGLE_SECRET;
//     const req = {} as any;
//     const res = {} as any;
//     await authHandler(req, res);
//     expect(NextAuth).toHaveBeenCalledWith(
//       req,
//       res,
//       expect.objectContaining({
//         providers: expect.arrayContaining([
//           expect.objectContaining({
//             id: 'github',
//             options: {
//               clientId: '',
//               clientSecret: ''
//             }
//           }),
//           expect.objectContaining({
//             id: 'facebook',
//             options: {
//               clientId: '',
//               clientSecret: ''
//             }
//           }),
//           expect.objectContaining({
//             id: 'google',
//             options: {
//               clientId: '',
//               clientSecret: ''
//             }
//           })
//         ])
//       })
//     );
//   });
// });
