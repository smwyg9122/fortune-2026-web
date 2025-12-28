import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, MapPin, User, Heart, DollarSign, Activity, Briefcase, ChevronRight, Star, AlertCircle } from 'lucide-react';

const FortuneApp = () => {
  const [language, setLanguage] = useState('ko');
  const [step, setStep] = useState('landing'); // landing, input, loading, result
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthTimeHour: '',
    birthTimeMinute: '',
    birthTimeAMPM: 'AM',
    gender: '',
    location: '',
    locationOther: '',
    timezone: ''
  });
  const [showLocationOther, setShowLocationOther] = useState(false);

  // AM/PM 시간을 24시간 형식으로 변환
  const convertTo24Hour = (hour, minute, ampm) => {
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };
  const [fortune, setFortune] = useState(null);
  const [savedFortunes, setSavedFortunes] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState('');

  // 백엔드 API URL (배포 시 실제 서버 URL로 변경)
  const API_URL = '';  // 이렇게 빈 문자열이어야 함!

  const translations = {
    ko: {
      title: '2026 신년운세',
      subtitle: '새해의 운명을 펼쳐보세요',
      startButton: '운세 보러가기',
      inputTitle: '당신의 정보를 입력해주세요',
      birthDate: '생년월일',
      birthDatePlaceholder: '1990-01-01',
      birthTime: '태어난 시각 (선택)',
      birthTimePlaceholder: '2:30 PM',
      hour: '시',
      minute: '분',
      gender: '성별 (선택)',
      genderMale: '남성',
      genderFemale: '여성',
      genderOther: '기타',
      location: '출생지 (선택)',
      locationPlaceholder: '도시 선택',
      locationJakarta: '자카르타',
      locationYogyakarta: '족자카르타',
      locationSeoul: '서울',
      locationOther: '직접 입력',
      locationOtherPlaceholder: '도시 이름 입력',
      timezone: '타임존 (선택)',
      timezonePlaceholder: 'UTC 선택',
      submitButton: '운세 확인하기',
      loading: '운세를 풀어내고 있습니다...',
      fortuneTitle: '2026년 신년운세',
      sajuSummary: '사주 요약',
      elementBalance: '오행 밸런스',
      personality: '성향',
      caution: '주의할 점',
      monthlyFortune: '월별 운세',
      love: '연애운',
      wealth: '재물운',
      health: '건강운',
      career: '커리어운',
      backButton: '처음으로',
      saveButton: '저장하기',
      savedNotice: '저장되었습니다',
      error: '오류가 발생했습니다. 다시 시도해주세요.'
    },
    en: {
      title: '2026 New Year Fortune',
      subtitle: 'Unveil Your Destiny for the New Year',
      startButton: 'Get Your Fortune',
      inputTitle: 'Enter Your Information',
      birthDate: 'Birth Date',
      birthDatePlaceholder: '1990-01-01',
      birthTime: 'Birth Time (Optional)',
      birthTimePlaceholder: '2:30 PM',
      hour: 'Hour',
      minute: 'Minute',
      gender: 'Gender (Optional)',
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      location: 'Birth Place (Optional)',
      locationPlaceholder: 'Select city',
      locationJakarta: 'Jakarta',
      locationYogyakarta: 'Yogyakarta',
      locationSeoul: 'Seoul',
      locationOther: 'Other',
      locationOtherPlaceholder: 'Enter city name',
      timezone: 'Timezone (Optional)',
      timezonePlaceholder: 'Select UTC',
      submitButton: 'Get My Fortune',
      loading: 'Revealing your fortune...',
      fortuneTitle: '2026 New Year Fortune',
      sajuSummary: 'Saju Summary',
      elementBalance: 'Element Balance',
      personality: 'Personality',
      caution: 'Things to Watch',
      monthlyFortune: 'Monthly Fortune',
      love: 'Love',
      wealth: 'Wealth',
      health: 'Health',
      career: 'Career',
      backButton: 'Start Over',
      saveButton: 'Save',
      savedNotice: 'Saved successfully',
      error: 'An error occurred. Please try again.'
    }
  };

  const t = translations[language];

  // 도시 옵션
  const locationOptions = [
    { value: '', label: language === 'ko' ? '선택하세요' : 'Select' },
    { value: 'Jakarta', label: language === 'ko' ? '자카르타' : 'Jakarta' },
    { value: 'Yogyakarta', label: language === 'ko' ? '족자카르타' : 'Yogyakarta' },
    { value: 'Seoul', label: language === 'ko' ? '서울' : 'Seoul' },
    { value: 'other', label: language === 'ko' ? '직접 입력' : 'Other' }
  ];

  // 타임존 옵션
  const timezoneOptions = [
    { value: '', label: language === 'ko' ? '선택하세요' : 'Select' },
    { value: 'UTC-12', label: 'UTC -12:00' },
    { value: 'UTC-11', label: 'UTC -11:00' },
    { value: 'UTC-10', label: 'UTC -10:00 (Hawaii)' },
    { value: 'UTC-9', label: 'UTC -09:00 (Alaska)' },
    { value: 'UTC-8', label: 'UTC -08:00 (Los Angeles, Vancouver)' },
    { value: 'UTC-7', label: 'UTC -07:00 (Denver, Phoenix)' },
    { value: 'UTC-6', label: 'UTC -06:00 (Chicago, Mexico City)' },
    { value: 'UTC-5', label: 'UTC -05:00 (New York, Toronto)' },
    { value: 'UTC-4', label: 'UTC -04:00 (Santiago)' },
    { value: 'UTC-3', label: 'UTC -03:00 (São Paulo, Buenos Aires)' },
    { value: 'UTC-2', label: 'UTC -02:00' },
    { value: 'UTC-1', label: 'UTC -01:00' },
    { value: 'UTC+0', label: 'UTC +00:00 (London, Lisbon)' },
    { value: 'UTC+1', label: 'UTC +01:00 (Paris, Berlin, Rome)' },
    { value: 'UTC+2', label: 'UTC +02:00 (Cairo, Athens)' },
    { value: 'UTC+3', label: 'UTC +03:00 (Moscow, Istanbul)' },
    { value: 'UTC+4', label: 'UTC +04:00 (Dubai)' },
    { value: 'UTC+5', label: 'UTC +05:00 (Karachi)' },
    { value: 'UTC+5:30', label: 'UTC +05:30 (Mumbai, Delhi)' },
    { value: 'UTC+6', label: 'UTC +06:00 (Dhaka)' },
    { value: 'UTC+7', label: 'UTC +07:00 (Bangkok, Jakarta)' },
    { value: 'UTC+8', label: 'UTC +08:00 (Singapore, Beijing, Hong Kong)' },
    { value: 'UTC+9', label: 'UTC +09:00 (Seoul, Tokyo)' },
    { value: 'UTC+10', label: 'UTC +10:00 (Sydney, Melbourne)' },
    { value: 'UTC+11', label: 'UTC +11:00' },
    { value: 'UTC+12', label: 'UTC +12:00 (Auckland)' }
  ];

  useEffect(() => {
    // Load saved fortunes from localStorage
    const saved = localStorage.getItem('fortunes');
    if (saved) {
      setSavedFortunes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (step === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            return 95;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('loading');
    setLoadingProgress(0);
    setError('');

    try {
      // AM/PM 시간을 24시간 형식으로 변환
      let birthTime24 = '';
      if (formData.birthTimeHour && formData.birthTimeMinute) {
        birthTime24 = convertTo24Hour(
          formData.birthTimeHour,
          formData.birthTimeMinute,
          formData.birthTimeAMPM
        );
      }

      const response = await fetch(`${API_URL}/api/fortune`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate: formData.birthDate,
          birthTime: birthTime24,
          gender: formData.gender,
          location: formData.location === 'other' ? formData.locationOther : formData.location,
          timezone: formData.timezone,
          language: language
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate fortune');
      }

      setLoadingProgress(100);
      
      setTimeout(() => {
        setFortune({
          ...data.data,
          timestamp: new Date().toISOString(),
          formData: { ...formData }
        });
        setStep('result');
      }, 500);

    } catch (error) {
      console.error('Error generating fortune:', error);
      setError(t.error + ' ' + (error.message || ''));
      setStep('input');
      setLoadingProgress(0);
    }
  };

  const saveFortune = () => {
    const updated = [fortune, ...savedFortunes].slice(0, 3);
    setSavedFortunes(updated);
    localStorage.setItem('fortunes', JSON.stringify(updated));
    
    const notice = document.querySelector('.save-notice');
    if (notice) {
      notice.style.opacity = '1';
      setTimeout(() => {
        notice.style.opacity = '0';
      }, 2000);
    }
  };

  const months = language === 'ko' 
    ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const elements = language === 'ko'
    ? { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' }
    : { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' };

  const elementColors = {
    wood: '#10b981',
    fire: '#ef4444',
    earth: '#f59e0b',
    metal: '#94a3b8',
    water: '#3b82f6'
  };

  return (
    <div className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@400;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Noto Serif KR', 'Cormorant Garamond', serif;
          -webkit-font-smoothing: antialiased;
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          position: relative;
          overflow-x: hidden;
          color: #f1f5f9;
        }

        .mystical-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.15;
          pointer-events: none;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%);
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.2;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #fbbf24, transparent);
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #a78bfa, transparent);
          bottom: 15%;
          right: 10%;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #ec4899, transparent);
          top: 50%;
          right: 5%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .lang-toggle {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 1000;
          display: flex;
          gap: 0.5rem;
          background: rgba(15, 12, 41, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          padding: 0.5rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
          animation: slideIn 0.6s ease-out;
        }

        .lang-btn {
          padding: 0.5rem 1.25rem;
          border: none;
          background: transparent;
          color: #cbd5e1;
          cursor: pointer;
          border-radius: 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          letter-spacing: 0.05em;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0f0c29;
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .landing-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          position: relative;
          animation: fadeIn 1s ease-out;
        }

        .main-title {
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          background: linear-gradient(135deg, #fbbf24 0%, #fcd34d 50%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          animation: shimmer 3s infinite linear, slideUp 1s ease-out;
          text-shadow: 0 0 60px rgba(251, 191, 36, 0.5);
          letter-spacing: 0.02em;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .subtitle {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          color: #e2e8f0;
          margin-bottom: 3rem;
          opacity: 0.9;
          animation: slideUp 1s ease-out 0.2s backwards;
          letter-spacing: 0.1em;
        }

        .start-btn {
          padding: 1.25rem 3rem;
          font-size: 1.125rem;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: none;
          border-radius: 3rem;
          color: #0f0c29;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          letter-spacing: 0.05em;
          box-shadow: 0 10px 40px rgba(251, 191, 36, 0.4);
          animation: slideUp 1s ease-out 0.4s backwards, pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .start-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 50px rgba(251, 191, 36, 0.6);
        }

        .input-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        .input-container {
          max-width: 600px;
          width: 100%;
          background: rgba(15, 12, 41, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 3rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.6s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .input-title {
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #fbbf24, #fcd34d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          background: rgba(30, 27, 75, 0.5);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 0.75rem;
          color: #f1f5f9;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: 'Noto Serif KR', serif;
        }

        .form-input:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
        }

        .form-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        .form-input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          color: #f1f5f9;
        }

        .form-input[type="date"]::-webkit-datetime-edit-text {
          color: #fbbf24;
          padding: 0 0.2em;
        }

        .form-input[type="date"]::-webkit-datetime-edit-month-field,
        .form-input[type="date"]::-webkit-datetime-edit-day-field,
        .form-input[type="date"]::-webkit-datetime-edit-year-field {
          color: #f1f5f9;
        }

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fbbf24' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 12px;
          padding-right: 2.5rem;
        }

        select.form-input option {
          background: #1e1b4b;
          color: #f1f5f9;
          padding: 0.5rem;
        }

        .gender-options {
          display: flex;
          gap: 1rem;
        }

        .gender-btn {
          flex: 1;
          padding: 1rem;
          background: rgba(30, 27, 75, 0.5);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 0.75rem;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .gender-btn.selected {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0f0c29;
          border-color: transparent;
        }

        .submit-btn {
          width: 100%;
          padding: 1.25rem;
          font-size: 1.125rem;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: none;
          border-radius: 1rem;
          color: #0f0c29;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        .loading-spinner {
          width: 100px;
          height: 100px;
          margin-bottom: 2rem;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.5rem;
          color: #e2e8f0;
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 300px;
          height: 6px;
          background: rgba(30, 27, 75, 0.5);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          transition: width 0.3s ease;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }

        .result-screen {
          min-height: 100vh;
          padding: 4rem 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        .result-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .result-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .result-title {
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          background: linear-gradient(135deg, #fbbf24, #fcd34d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .result-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.75rem 2rem;
          background: rgba(15, 12, 41, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 2rem;
          color: #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Noto Serif KR', serif;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .action-btn:hover {
          border-color: #fbbf24;
          transform: translateY(-2px);
        }

        .save-notice {
          position: fixed;
          top: 6rem;
          right: 2rem;
          background: rgba(16, 185, 129, 0.9);
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-weight: 600;
          z-index: 1000;
        }

        .fortune-section {
          background: rgba(15, 12, 41, 0.6);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(251, 191, 36, 0.2);
          animation: slideUp 0.6s ease-out backwards;
        }

        .fortune-section:nth-child(2) { animation-delay: 0.1s; }
        .fortune-section:nth-child(3) { animation-delay: 0.2s; }
        .fortune-section:nth-child(4) { animation-delay: 0.3s; }

        .section-title {
          font-family: 'Cinzel', 'Noto Serif KR', serif;
          font-size: 1.5rem;
          color: #fbbf24;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .element-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .element-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .element-label {
          width: 60px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .element-track {
          flex: 1;
          height: 12px;
          background: rgba(30, 27, 75, 0.5);
          border-radius: 6px;
          overflow: hidden;
        }

        .element-fill {
          height: 100%;
          transition: width 1s ease-out;
          border-radius: 6px;
        }

        .element-value {
          width: 40px;
          text-align: right;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .text-content {
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 1rem;
        }

        .monthly-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .month-card {
          background: rgba(30, 27, 75, 0.5);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1rem;
          padding: 1.25rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .month-card:hover {
          transform: translateY(-5px);
          border-color: #fbbf24;
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
        }

        .month-name {
          font-size: 0.85rem;
          color: #fbbf24;
          font-weight: 600;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .month-keyword {
          font-size: 0.95rem;
          color: #e2e8f0;
        }

        .fortune-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .fortune-card {
          background: rgba(30, 27, 75, 0.5);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .fortune-card:hover {
          transform: translateY(-5px);
          border-color: #fbbf24;
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
        }

        .fortune-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #fbbf24;
          margin-bottom: 1rem;
        }

        .fortune-card-content {
          color: #cbd5e1;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .lang-toggle {
            top: 1rem;
            right: 1rem;
          }

          .input-container {
            padding: 2rem 1.5rem;
          }

          .result-screen {
            padding: 3rem 1rem;
          }

          .fortune-section {
            padding: 1.5rem;
          }

          .monthly-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.75rem;
          }
        }
      `}</style>

      <div className="mystical-bg" />
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <div className="lang-toggle">
        <button 
          className={`lang-btn ${language === 'ko' ? 'active' : ''}`}
          onClick={() => setLanguage('ko')}
        >
          한국어
        </button>
        <button 
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
      </div>

      {step === 'landing' && (
        <div className="landing-screen">
          <h1 className="main-title">{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
          <button className="start-btn" onClick={() => setStep('input')}>
            <Sparkles size={24} />
            {t.startButton}
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {step === 'input' && (
        <div className="input-screen">
          <div className="input-container">
            <h2 className="input-title">{t.inputTitle}</h2>
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {t.birthDate}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                  lang="en-US"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {t.birthTime}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="form-input"
                    value={formData.birthTimeHour}
                    onChange={(e) => setFormData({ ...formData, birthTimeHour: e.target.value })}
                    style={{ flex: '1', cursor: 'pointer' }}
                  >
                    <option value="">{t.hour}</option>
                    {[...Array(12)].map((_, i) => {
                      const hour = i + 1;
                      return <option key={hour} value={hour}>{hour}</option>
                    })}
                  </select>
                  <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>:</span>
                  <select
                    className="form-input"
                    value={formData.birthTimeMinute}
                    onChange={(e) => setFormData({ ...formData, birthTimeMinute: e.target.value })}
                    style={{ flex: '1', cursor: 'pointer' }}
                  >
                    <option value="">{t.minute}</option>
                    {[...Array(60)].map((_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return <option key={minute} value={minute}>{minute}</option>
                    })}
                  </select>
                  <select
                    className="form-input"
                    value={formData.birthTimeAMPM}
                    onChange={(e) => setFormData({ ...formData, birthTimeAMPM: e.target.value })}
                    style={{ flex: '0.8', cursor: 'pointer' }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {t.gender}
                </label>
                <div className="gender-options">
                  <button
                    type="button"
                    className={`gender-btn ${formData.gender === 'male' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                  >
                    {t.genderMale}
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${formData.gender === 'female' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                  >
                    {t.genderFemale}
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${formData.gender === 'other' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, gender: 'other' })}
                  >
                    {t.genderOther}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {t.location}
                </label>
                <select
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, location: value, locationOther: '' });
                    setShowLocationOther(value === 'other');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showLocationOther && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '0.5rem' }}
                    value={formData.locationOther}
                    onChange={(e) => setFormData({ ...formData, locationOther: e.target.value })}
                    placeholder={t.locationOtherPlaceholder}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  {t.timezone}
                </label>
                <select
                  className="form-input"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  {timezoneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="submit-btn">
                <Sparkles size={20} />
                {t.submitButton}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="loading-screen">
          <div className="loading-spinner">
            <Sparkles size={100} color="#fbbf24" />
          </div>
          <div className="loading-text">{t.loading}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      )}

      {step === 'result' && fortune && (
        <div className="result-screen">
          <div className="save-notice">{t.savedNotice}</div>
          
          <div className="result-container">
            <div className="result-header">
              <h1 className="result-title">{t.fortuneTitle}</h1>
              <div className="result-actions">
                <button className="action-btn" onClick={() => setStep('landing')}>
                  <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                  {t.backButton}
                </button>
                <button className="action-btn" onClick={saveFortune}>
                  <Star size={18} />
                  {t.saveButton}
                </button>
              </div>
            </div>

            <div className="fortune-section">
              <h2 className="section-title">
                <Sparkles size={24} />
                {t.sajuSummary}
              </h2>
              
              <h3 style={{ color: '#fbbf24', fontSize: '1.125rem', marginBottom: '1rem', marginTop: '1.5rem' }}>
                {t.elementBalance}
              </h3>
              <div className="element-bars">
                {Object.entries(fortune.elementBalance).map(([element, value]) => (
                  <div key={element} className="element-bar">
                    <div className="element-label">{elements[element]}</div>
                    <div className="element-track">
                      <div 
                        className="element-fill" 
                        style={{ 
                          width: `${value}%`,
                          backgroundColor: elementColors[element]
                        }} 
                      />
                    </div>
                    <div className="element-value">{value}%</div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: '#fbbf24', fontSize: '1.125rem', marginBottom: '1rem', marginTop: '2rem' }}>
                {t.personality}
              </h3>
              <div className="text-content">{fortune.personality}</div>

              <h3 style={{ color: '#fbbf24', fontSize: '1.125rem', marginBottom: '1rem', marginTop: '2rem' }}>
                {t.caution}
              </h3>
              <div className="text-content">{fortune.caution}</div>
            </div>

            <div className="fortune-section">
              <h2 className="section-title">
                <Calendar size={24} />
                {t.monthlyFortune}
              </h2>
              <div className="monthly-grid">
                {months.map((month, index) => (
                  <div key={index} className="month-card">
                    <div className="month-name">{month}</div>
                    <div className="month-keyword">{fortune.monthlyKeywords[index]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fortune-section">
              <div className="fortune-grid">
                <div className="fortune-card">
                  <div className="fortune-card-title">
                    <Heart size={20} />
                    {t.love}
                  </div>
                  <div className="fortune-card-content">{fortune.love}</div>
                </div>

                <div className="fortune-card">
                  <div className="fortune-card-title">
                    <DollarSign size={20} />
                    {t.wealth}
                  </div>
                  <div className="fortune-card-content">{fortune.wealth}</div>
                </div>

                <div className="fortune-card">
                  <div className="fortune-card-title">
                    <Activity size={20} />
                    {t.health}
                  </div>
                  <div className="fortune-card-content">{fortune.health}</div>
                </div>

                <div className="fortune-card">
                  <div className="fortune-card-title">
                    <Briefcase size={20} />
                    {t.career}
                  </div>
                  <div className="fortune-card-content">{fortune.career}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FortuneApp;
