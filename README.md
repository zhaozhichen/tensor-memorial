# Tensor's Memorial Website

A beautiful, playful memorial website to celebrate and share memories of Tensor, the golden retriever. Friends and family can share stories, photos, and videos.

## Features
- Gallery of admin-uploaded photos and videos
- Stories & Tributes page for friends to share memories (with or without media)
- All media and stories are stored in Cloudinary
- Responsive, golden-themed design

## Getting Started

### 1. Install dependencies
```sh
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the project root with your Cloudinary credentials:
```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
```

### 3. Run the development server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment (Vercel + Custom Domain)
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com/) and import your repo.
3. In Vercel dashboard, set the same environment variables as above.
4. Deploy!
5. Add your custom domain in the Vercel dashboard and follow DNS instructions.

## Cloudinary Folder Structure
- **Admin assets:** Upload to the `admin` folder in Cloudinary (via dashboard or script).
- **User stories:** All user uploads go to the `stories` folder automatically.

## License
MIT
