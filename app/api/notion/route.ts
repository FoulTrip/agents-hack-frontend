import { NextResponse } from 'next/server';
import { NotionAPI } from 'notion-client';
import { parsePageId } from 'notion-utils';

const notion = new NotionAPI({
  authToken: process.env.NOTION_API_KEY || process.env.NOTION_TOKEN
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing Notion URL' }, { status: 400 });
  }

  try {
    const pageId = parsePageId(url);
    if (!pageId) {
      return NextResponse.json({ error: 'Invalid Notion URL' }, { status: 400 });
    }
    const recordMap = await notion.getPage(pageId);
    return NextResponse.json(recordMap);
  } catch (error: any) {
    console.error('Notion API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
