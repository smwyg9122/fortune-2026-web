// api/fortune.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { birthDate, birthTime, gender, location, timezone, language } = req.body;
    const uniqueSeed = `${birthDate}-${birthTime}-${Date.now()}-${Math.random()}`;

    const prompt = language === 'ko' 
      ? `당신은 전문 사주명리학자이자 운세 전문가입니다. 다음 정보를 바탕으로 2026년 신년운세를 작성해주세요:

생년월일: ${birthDate}
${birthTime ? `태어난 시각: ${birthTime}` : ''}
${gender ? `성별: ${gender}` : ''}
${location ? `출생지: ${location}` : ''}

고유 ID: ${uniqueSeed}

중요: 이 고유 ID를 기반으로 완전히 독창적이고 개인화된 운세를 작성하세요.

다음 JSON 형식으로만 응답하세요:
{
  "elementBalance": {"wood": 숫자, "fire": 숫자, "earth": 숫자, "metal": 숫자, "water": 숫자},
  "personality": "성격 설명 2-3문장",
  "caution": "주의사항 2-3문장",
  "monthlyKeywords": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  "love": "연애운 2-3문장",
  "wealth": "재물운 2-3문장",
  "health": "건강운 2-3문장",
  "career": "커리어운 2-3문장"
}`
      : `You are an expert fortune teller. Generate a 2026 fortune reading:

Birth Date: ${birthDate}
${birthTime ? `Birth Time: ${birthTime}` : ''}
${gender ? `Gender: ${gender}` : ''}
${location ? `Location: ${location}` : ''}

Unique ID: ${uniqueSeed}

Respond ONLY with valid JSON:
{
  "elementBalance": {"wood": number, "fire": number, "earth": number, "metal": number, "water": number},
  "personality": "2-3 sentences",
  "caution": "2-3 sentences",
  "monthlyKeywords": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "love": "2-3 sentences",
  "wealth": "2-3 sentences",
  "health": "2-3 sentences",
  "career": "2-3 sentences"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert fortune teller. Respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 1500
    });

    let fortuneText = completion.choices[0].message.content;
    fortuneText = fortuneText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const fortuneData = JSON.parse(fortuneText);
    
    res.status(200).json({ success: true, data: fortuneData });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};