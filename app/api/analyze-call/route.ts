import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const TRANSCRIBE_URL = 'https://api.assemblyai.com/v2/transcript';

async function uploadToAssembly(fileBuffer: Buffer): Promise<string> {
  const uploadRes = await axios.post(
    'https://api.assemblyai.com/v2/upload',
    fileBuffer,
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'transfer-encoding': 'chunked',
      },
    }
  );
  return uploadRes.data.upload_url;
}

async function transcribeAudio(uploadUrl: string): Promise<string> {
  const response = await axios.post(
    TRANSCRIBE_URL,
    {
      audio_url: uploadUrl,
    },
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
    }
  );

  const transcriptId = response.data.id;
  let status = 'queued';
  let transcriptText = '';

  while (status !== 'completed') {
    const polling = await axios.get(`${TRANSCRIBE_URL}/${transcriptId}`, {
      headers: { authorization: ASSEMBLYAI_API_KEY },
    });
    status = polling.data.status;
    if (status === 'completed') {
      transcriptText = polling.data.text;
    } else if (status === 'error') {
      throw new Error('Transcription failed');
    }
    await new Promise(res => setTimeout(res, 2000));
  }

  return transcriptText;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'No file uploaded.',
          scores: {},
          overallFeedback: '',
          observation: '',
        },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadUrl = await uploadToAssembly(buffer);
    const transcript = await transcribeAudio(uploadUrl);

    const text = transcript?.toLowerCase?.() ?? '';
    const scores = {
      greeting: text.includes('hello') || text.includes('good morning') ? 5 : 0,
      collectionUrgency: text.includes('pay') || text.includes('due') ? 14 : 7,
      rebuttalCustomerHandling:
        text.includes('objection') || text.includes('issue') ? 13 : 7,
      callEtiquette:
        text.includes('please') || text.includes('thank you') ? 15 : 10,
      callDisclaimer:
        text.includes('recording') || text.includes('disclaimer') ? 5 : 0,
      correctDisposition:
        text.includes('noted') || text.includes('recorded') ? 10 : 0,
      callClosing:
        text.includes('thank you') || text.includes('have a nice day') ? 5 : 0,
      fatalIdentification:
        text.includes('this is') || text.includes('speaking') ? 5 : 0,
      fatalTapeDiscloser:
        text.includes('recorded line') ||
        text.includes('call is being recorded')
          ? 10
          : 0,
      fatalToneLanguage:
        text.includes('abuse') || text.includes('threat') ? 0 : 15,
    };

    const result = {
      scores,
      overallFeedback: `The agent maintained ${
        scores.callEtiquette >= 12 ? 'excellent' : 'moderate'
      } call etiquette. ${
        scores.collectionUrgency > 10
          ? 'Collection urgency was properly conveyed.'
          : 'Urgency could be improved.'
      }`,
      observation: `Greeting: ${
        scores.greeting ? 'Passed' : 'Missed'
      }, Disclaimer: ${scores.callDisclaimer ? 'Given' : 'Missing'}, Closing: ${
        scores.callClosing ? 'Proper' : 'Needs improvement'
      }`,
    };

    return NextResponse.json(result);
  } catch (err) {
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    }
    // Always return a consistent object shape
    return NextResponse.json(
      {
        error: message,
        scores: {},
        overallFeedback: '',
        observation: '',
      },
      { status: 500 }
    );
  }
}
