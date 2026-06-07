import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import withSubscription from '../components/withSubscription';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, RefreshCw, CheckCircle, XCircle, Zap, Lock, Pill, AlertTriangle, Shield, ChevronDown, ChevronUp, RotateCcw, Download, Clock, MessageCircle } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import veagLogoPng from '../assets/veag_logo.png';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import AskVeAg from '../components/AskVeAg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CaseDetail = ({ daysRemaining }) => {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [caseData, setCaseData] = useState(null);
  const [caseResult, setCaseResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showAskVeAg, setShowAskVeAg] = useState(false);

  // Treatment system state
  const [treatmentData, setTreatmentData] = useState({
    treatment: null,
    causes: null,
    prevention: null
  });
  const [treatmentLoading, setTreatmentLoading] = useState({
    treatment: false,
    causes: false,
    prevention: false
  });
  const [treatmentError, setTreatmentError] = useState({
    treatment: null,
    causes: null,
    prevention: null
  });
  const [activeTab, setActiveTab] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(false);

  const allSectionsFetched = !!(treatmentData.treatment && treatmentData.causes && treatmentData.prevention);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const fetchCaseDetail = async () => {
    if (!currentUser?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cases/${caseId}`);
      
      // Security check: Verify case belongs to current user
      if (response.data.case.userId !== currentUser.userId) {
        // console.warn('Unauthorized access attempt to case:', caseId);
        setUnauthorized(true);
      } else {
        setCaseData(response.data.case);
        setSelectedImage(response.data.case.images[0]?.url || null);

        // If completed, fetch result
        if (response.data.case.status === 'completed') {
          try {
            const resultResponse = await axios.get(`${API_BASE_URL}/cases/${caseId}/result`);
            setCaseResult(resultResponse.data.result);
          } catch (err) {
            // console.error('Error fetching result:', err);
          }
        }

        // Auto refresh if processing
        if (response.data.case.status === 'processing' && !autoRefresh) {
          setAutoRefresh(true);
        } else if (response.data.case.status !== 'processing' && autoRefresh) {
          setAutoRefresh(false);
        }
      }
    } catch (err) {
      // console.error('Error fetching case:', err);
      if (err.response?.status === 404) {
        setUnauthorized(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [caseId, currentUser]);

  // --- localStorage helpers for persistent treatment button states ---
  const TREATMENT_TYPES = ['treatment', 'causes', 'prevention'];

  const saveTreatmentState = (type, state) => {
    const key = `veag_treatment_${caseId}_${type}`;
    if (state === 'completed') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, state); // 'started' | 'failed'
    }
  };

  const getStoredTreatmentState = (type) =>
    localStorage.getItem(`veag_treatment_${caseId}_${type}`);

  // Poll DB every 5 s for types that were 'started' before a page reload
  const pollForPendingTreatments = (pendingTypes) => {
    if (!pendingTypes.length) return;
    const MAX_ATTEMPTS = 24; // 24 × 5 s = 2 min
    let attempts = 0;
    let remaining = [...pendingTypes];

    const poll = async () => {
      if (!remaining.length) return;
      attempts++;
      try {
        const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/treatment-info`);
        if (response.data.success && response.data.treatments) {
          const done = [];
          remaining.forEach(type => {
            if (response.data.treatments[type]) {
              setTreatmentData(prev => ({ ...prev, [type]: response.data.treatments[type] }));
              setTreatmentLoading(prev => ({ ...prev, [type]: false }));
              saveTreatmentState(type, 'completed');
              done.push(type);
            }
          });
          remaining = remaining.filter(t => !done.includes(t));
        }
      } catch (_) { /* keep polling */ }

      if (!remaining.length) return;

      if (attempts >= MAX_ATTEMPTS) {
        remaining.forEach(type => {
          setTreatmentLoading(prev => ({ ...prev, [type]: false }));
          setTreatmentError(prev => ({ ...prev, [type]: 'Generation timed out. Please retry.' }));
          saveTreatmentState(type, 'failed');
        });
        return;
      }
      setTimeout(poll, 5000);
    };

    setTimeout(poll, 3000); // first check after 3 s
  };

  // Fetch existing treatment info when case is completed with disease
  useEffect(() => {
    if (caseData?.status === 'completed' && caseResult && !caseResult.diseaseStatus.toLowerCase().includes('healthy')) {
      fetchExistingTreatments().then(fetched => {
        // After loading DB data, restore any in-progress / failed states from localStorage
        const pendingTypes = [];
        TREATMENT_TYPES.forEach(type => {
          if (fetched[type]) return; // already completed in DB
          const stored = getStoredTreatmentState(type);
          if (stored === 'started') {
            setTreatmentLoading(prev => ({ ...prev, [type]: true }));
            setActiveTab(prev => prev || type);
            pendingTypes.push(type);
          } else if (stored === 'failed') {
            setTreatmentError(prev => ({
              ...prev,
              [type]: 'Generation failed. Please retry.'
            }));
            setActiveTab(prev => prev || type);
          }
        });
        if (pendingTypes.length) pollForPendingTreatments(pendingTypes);
      });
    }
  }, [caseData?.status, caseResult]);

  const fetchExistingTreatments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/treatment-info`);
      if (response.data.success && response.data.treatments) {
        const fetched = response.data.treatments;
        setTreatmentData(prev => ({ ...prev, ...fetched }));
        // Clear localStorage for any type now confirmed complete in DB
        TREATMENT_TYPES.forEach(type => {
          if (fetched[type]) saveTreatmentState(type, 'completed');
        });
        return fetched;
      }
    } catch (_) {
      // Silent fail - treatments will be generated on demand
    }
    return {};
  };

  const generateTreatment = async (type) => {
    setActiveTab(type);
    setTreatmentLoading(prev => ({ ...prev, [type]: true }));
    setTreatmentError(prev => ({ ...prev, [type]: null }));
    saveTreatmentState(type, 'started'); // persist so reload shows loading spinner

    try {
      const response = await axios.post(`${API_BASE_URL}/cases/${caseId}/treatment-info/${type}`);
      if (response.data.success) {
        setTreatmentData(prev => ({ ...prev, [type]: response.data.treatmentInfo }));
        saveTreatmentState(type, 'completed');
      }
    } catch (err) {
      setTreatmentError(prev => ({
        ...prev,
        [type]: err.response?.data?.error || `Failed to generate ${type} information. Please try again.`
      }));
      saveTreatmentState(type, 'failed');
    } finally {
      setTreatmentLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const retryTreatment = (type) => {
    generateTreatment(type);
  };

  // Simple markdown renderer for Gemini responses
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let listType = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ordered') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1.5 ml-2 mb-3">
              {listItems.map((item, i) => (
                <li key={i} className="text-white/90 text-sm leading-relaxed">{renderInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="space-y-1.5 ml-2 mb-3">
              {listItems.map((item, i) => (
                <li key={i} className="text-white/90 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    const renderInline = (text) => {
      // Handle **bold** text
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        flushList();
        continue;
      }

      // Headings
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h-${i}`} className="text-base font-bold text-violet-300 mt-4 mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0"></div>
            {line.replace('## ', '')}
          </h3>
        );
        continue;
      }

      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h1-${i}`} className="text-lg font-bold text-white mt-3 mb-2">{line.replace('# ', '')}</h2>
        );
        continue;
      }

      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (listType !== 'unordered') flushList();
        listType = 'unordered';
        listItems.push(line.replace(/^[-*]\s/, ''));
        continue;
      }

      // Numbered lists
      const numberedMatch = line.match(/^\d+[.)]\s(.+)/);
      if (numberedMatch) {
        if (listType !== 'ordered') flushList();
        listType = 'ordered';
        listItems.push(numberedMatch[1]);
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-white/90 text-sm leading-relaxed mb-2">{renderInline(line)}</p>
      );
    }

    flushList();
    return elements;
  };

  // Strip markdown for PDF rendering
  const stripMarkdownForPDF = (text) => {
    if (!text) return [];
    const lines = [];
    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) { lines.push({ type: 'empty', text: '' }); return; }
      if (trimmed.startsWith('## ')) {
        lines.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1') });
      } else if (trimmed.startsWith('# ')) {
        lines.push({ type: 'h1', text: trimmed.replace(/^#\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1') });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        lines.push({ type: 'bullet', text: trimmed.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1') });
      } else {
        const numMatch = trimmed.match(/^(\d+)[.)]\s(.+)/);
        if (numMatch) {
          lines.push({ type: 'numbered', text: `${numMatch[1]}. ${numMatch[2].replace(/\*\*(.*?)\*\*/g, '$1')}` });
        } else {
          lines.push({ type: 'text', text: trimmed.replace(/\*\*(.*?)\*\*/g, '$1') });
        }
      }
    });
    return lines;
  };

  const generateReport = async () => {
    setReportGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');

      // Load PNG logo as base64 via canvas
      const loadImageBase64 = (src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = src;
      });
      const logoBase64 = await loadImageBase64(veagLogoPng);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const ml = 18;
      const mr = 18;
      const contentW = pageW - ml - mr;
      let y = 0;

      const checkPageBreak = (needed = 20) => {
        if (y + needed > pageH - 18) {
          doc.addPage();
          doc.setFillColor(20, 83, 45);
          doc.rect(0, 0, pageW, 10, 'F');
          doc.setFillColor(52, 211, 153);
          doc.rect(0, 9, pageW, 1.5, 'F');
          doc.setTextColor(167, 243, 208);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('VeAg Disease Analysis Report', ml, 7);
          doc.text(`Case #${caseData.caseId}`, pageW - mr, 7, { align: 'right' });
          y = 18;
        }
      };

      // ── HEADER ──────────────────────────────────────────────
      doc.setFillColor(20, 83, 45);
      doc.rect(0, 0, pageW, 52, 'F');
      doc.setFillColor(52, 211, 153);
      doc.rect(0, 49, pageW, 3, 'F');

      // Logo circle — raised to align with VeAg heading baseline (y=20)
      doc.setFillColor(255, 255, 255);
      doc.circle(ml + 9, 20, 9, 'F');
      if (logoBase64) {
        // PNG centered inside the white circle: 16×16mm box, top-left at (ml+1, 12)
        doc.addImage(logoBase64, 'PNG', ml + 1, 12, 16, 16);
      }

      // VeAg name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('VeAg', ml + 23, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(167, 243, 208);
      doc.text('Agricultural Disease Intelligence Platform', ml + 23, 28);

      // Right side
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Disease Analysis Report', pageW - mr, 20, { align: 'right' });
      const dlDate = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(167, 243, 208);
      doc.text(`Downloaded: ${dlDate}`, pageW - mr, 28, { align: 'right' });

      y = 60;

      // ── INFO CARDS ROW ───────────────────────────────────────
      const halfW = (contentW - 6) / 2;

      // LEFT CARD — User Info
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(134, 239, 172);
      doc.setLineWidth(0.5);
      doc.roundedRect(ml, y, halfW, 30, 3, 3, 'FD');
      doc.setFillColor(22, 163, 74);
      doc.roundedRect(ml, y, 3.5, 30, 1.5, 1.5, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('USER INFORMATION', ml + 7, y + 9);
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(currentUser?.name || 'N/A', ml + 7, y + 17);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(currentUser?.email || 'N/A', ml + 7, y + 24);

      // RIGHT CARD — Case Info
      const rx = ml + halfW + 6;
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(147, 197, 253);
      doc.setLineWidth(0.5);
      doc.roundedRect(rx, y, halfW, 30, 3, 3, 'FD');
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(rx, y, 3.5, 30, 1.5, 1.5, 'F');
      doc.setTextColor(29, 78, 216);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CASE INFORMATION', rx + 7, y + 9);
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Case ID: #${caseData.caseId}`, rx + 7, y + 17);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${formatDate(caseResult.processedAt)}`, rx + 7, y + 24);

      y += 38;

      // ── DISEASE BANNER ───────────────────────────────────────
      doc.setFillColor(255, 247, 237);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.5);
      doc.roundedRect(ml, y, contentW, 26, 3, 3, 'FD');
      doc.setFillColor(217, 119, 6);
      doc.roundedRect(ml, y, 4, 26, 2, 2, 'F');
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DISEASE DETECTED', ml + 9, y + 9);
      doc.setFontSize(13);
      doc.setTextColor(180, 83, 9);
      doc.text(caseResult.diseaseStatus, ml + 9, y + 20);
      // Right sub-column — anchored to left so values never hit the right margin
      const rightColX = ml + 100;
      doc.setFontSize(7);
      doc.setTextColor(120, 53, 15);
      doc.setFont('helvetica', 'bold');
      doc.text('PROCESSING TIME', rightColX, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(180, 83, 9);
      doc.text(`${(caseResult.processingTime / 1000).toFixed(2)}s`, rightColX, y + 14);
      doc.setFontSize(7);
      doc.setTextColor(120, 53, 15);
      doc.setFont('helvetica', 'bold');
      doc.text('CROP TYPE', rightColX, y + 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(180, 83, 9);
      doc.text(caseData.cropName.charAt(0).toUpperCase() + caseData.cropName.slice(1), rightColX, y + 25);

      y += 34;

      // ── SECTION RENDERER ─────────────────────────────────────
      const renderSection = (title, iconChar, content, colors, generatedAt) => {
        const { headerBg, headerText, h2Color, bulletDot } = colors;
        checkPageBreak(22);

        // Section header bar
        doc.setFillColor(...headerBg);
        doc.roundedRect(ml, y, contentW, 13, 2, 2, 'F');
        // Icon circle
        doc.setFillColor(255, 255, 255);
        doc.circle(ml + 8.5, y + 6.5, 4.5, 'F');
        doc.setTextColor(...headerBg);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(iconChar, ml + 8.5, y + 9.2, { align: 'center' });
        doc.setTextColor(...headerText);
        doc.setFontSize(11);
        doc.text(title, ml + 17, y + 9);
        // Generation timestamp — left-anchored after title to avoid right margin collision
        if (generatedAt) {
          const genLabel = `Generated: ${formatDate(generatedAt)}`;
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(255, 255, 255);
          doc.text(genLabel, ml + 130, y + 9);
        }
        y += 16;

        const lines = stripMarkdownForPDF(content);
        let emptyRun = 0;
        lines.forEach(({ type, text }) => {
          if (type === 'empty') {
            emptyRun++;
            if (emptyRun < 2) y += 2;
            return;
          }
          emptyRun = 0;
          checkPageBreak(14);

          if (type === 'h1' || type === 'h2') {
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...h2Color);
            const wrapped = doc.splitTextToSize(text, contentW - 14);
            doc.text(wrapped, ml + 6, y);
            const lw = doc.getTextWidth(wrapped[0].length > 30 ? wrapped[0].substring(0, 30) : wrapped[0]) + 2;
            doc.setDrawColor(...h2Color);
            doc.setLineWidth(0.3);
            doc.line(ml + 6, y + 1.8, ml + 6 + Math.min(lw, contentW - 14), y + 1.8);
            y += wrapped.length * 5.5 + 2;
          } else if (type === 'bullet') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(text, contentW - 20);
            doc.setFillColor(...bulletDot);
            doc.circle(ml + 9, y - 1.2, 1.2, 'F');
            doc.text(wrapped, ml + 13, y);
            y += wrapped.length * 5 + 1.5;
          } else if (type === 'numbered') {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(text, contentW - 14);
            doc.text(wrapped, ml + 6, y);
            y += wrapped.length * 5 + 1.5;
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            const wrapped = doc.splitTextToSize(text, contentW - 6);
            doc.text(wrapped, ml + 4, y);
            y += wrapped.length * 5 + 1.5;
          }
        });
        y += 10;
      };

      // ── RENDER ALL THREE SECTIONS ────────────────────────────
      renderSection(
        'Treatment Guide', 'Rx', treatmentData.treatment.content,
        { headerBg: [22, 163, 74], headerText: [255, 255, 255], h2Color: [15, 107, 50], bulletDot: [34, 197, 94] },
        treatmentData.treatment.generatedAt || treatmentData.treatment.createdAt
      );
      renderSection(
        'Disease Causes', '!', treatmentData.causes.content,
        { headerBg: [217, 119, 6], headerText: [255, 255, 255], h2Color: [154, 78, 3], bulletDot: [245, 158, 11] },
        treatmentData.causes.generatedAt || treatmentData.causes.createdAt
      );
      renderSection(
        'Prevention Strategies', '+', treatmentData.prevention.content,
        { headerBg: [37, 99, 235], headerText: [255, 255, 255], h2Color: [23, 64, 178], bulletDot: [59, 130, 246] },
        treatmentData.prevention.generatedAt || treatmentData.prevention.createdAt
      );

      // ── FOOTER on every page ─────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const ph = doc.internal.pageSize.getHeight();
        doc.setFillColor(240, 253, 244);
        doc.rect(0, ph - 12, pageW, 12, 'F');
        doc.setDrawColor(134, 239, 172);
        doc.setLineWidth(0.4);
        doc.line(0, ph - 12, pageW, ph - 12);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('This report is generated by VeAg AI platform. For agricultural advisory purposes only.', ml, ph - 5);
        doc.text(`Page ${i} of ${totalPages}`, pageW - mr, ph - 5, { align: 'right' });
      }

      // Save
      const safeDate = new Date().toISOString().slice(0, 10);
      doc.save(`VeAg_Report_${caseData.caseId}_${safeDate}.pdf`);
    } catch (err) {
      // console.error('Error generating report:', err);
    } finally {
      setReportGenerating(false);
    }
  };

  const isDiseaseDetected = () => {
    return caseData?.status === 'completed' && 
           caseResult && 
           !caseResult.diseaseStatus.toLowerCase().includes('healthy');
  };

  // Auto-refresh when processing
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCaseDetail();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleProcessCase = async () => {
    try {
      setProcessing(true);
      setProcessingError(null);

      const response = await axios.post(`${API_BASE_URL}/cases/${caseId}/process`);

      if (response.data.success) {
        // Start auto-refresh
        setAutoRefresh(true);
        // Refresh immediately
        fetchCaseDetail();
      }
    } catch (err) {
      // console.error('Error processing case:', err);
      setProcessingError(err.response?.data?.error || 'Failed to start processing');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = () => {
    fetchCaseDetail();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateWithSeconds = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-600/80 border-yellow-400/50', text: 'text-white', label: t.status.pending },
      processing: { bg: 'bg-blue-600/80 border-blue-400/50', text: 'text-white', label: t.status.processing },
      completed: { bg: 'bg-green-600/80 border-green-400/50', text: 'text-white', label: t.status.completed },
      failed: { bg: 'bg-red-600/80 border-red-400/50', text: 'text-white', label: t.status.failed }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-xl ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Page Loading State
  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 flex items-center justify-center z-50">
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 border-4 border-transparent border-t-green-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-6 border-4 border-transparent border-t-orange-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <svg className="w-full h-64" viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z" fill="#a0522d" opacity="0.3"/>
            <path d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z" fill="#d97706" opacity="0.2"/>
          </svg>
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 border-4 border-transparent border-t-green-400 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 border-4 border-transparent border-t-orange-300 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-white font-semibold text-lg">{t.caseDetail.loadingCase}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized Access
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <svg className="w-full h-64" viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z" fill="#a0522d" opacity="0.3"/>
            <path d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z" fill="#d97706" opacity="0.2"/>
          </svg>
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>

        <div className="relative z-10 max-w-md w-full bg-black/40 backdrop-blur-2xl border border-red-400/50 rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-400/50 flex items-center justify-center backdrop-blur-xl">
              <Lock className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{t.caseDetail.unauthorizedTitle}</h2>
              <p className="text-white/80 text-lg mb-6">
                {t.caseDetail.unauthorizedMessage}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
            >
              {t.caseDetail.goToDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case Detail View
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden">
      {/* Background Mountains */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <svg className="w-full h-64" viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z" fill="#a0522d" opacity="0.3"/>
          <path d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z" fill="#d97706" opacity="0.2"/>
        </svg>
      </div>

      {/* Grass Layer */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>

      {/* Animated Clouds */}
      <motion.div 
        className="fixed top-20 left-0 w-32 h-16 bg-white/30 rounded-full blur-xl"
        animate={{ x: [0, 1200] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed top-40 right-0 w-40 h-20 bg-white/30 rounded-full blur-xl"
        animate={{ x: [1200, -200] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Header */}
      <header className="sticky top-0 bg-black/30 backdrop-blur-2xl border-b border-white/20 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/manage-cases')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={veagLogo} alt="VeAg" className="w-10 h-10 rounded-full" />
              </div>
              <span className="text-2xl font-bold text-white">VeAg</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSupport(!showSupport)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img 
                  src={currentUser?.photoURL} 
                  alt={currentUser?.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Support Popup */}
      {showSupport && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-50 bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl w-80"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{t.caseDetail.needHelp}</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">
            {t.caseDetail.supportText}
          </p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.caseDetail.contactSupport}
          </a>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Case Header */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t.caseDetail.caseNumber} #{caseData.caseId}
              </h1>
              <p className="text-white/70">{formatDate(caseData.createdAt)}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {getStatusBadge(caseData.status)}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/40 backdrop-blur-xl"
                title="Refresh case status"
              >
                <RefreshCw className="w-4 h-4" />
                {t.caseDetail.refresh}
              </button>
              <div className="bg-green-600/80 border border-green-400/50 backdrop-blur-xl px-4 py-2 rounded-lg">
                <span className="text-sm text-white font-semibold">
                  {t.caseDetail.plan}: {daysRemaining} {t.caseDetail.daysLeft}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{t.caseDetail.images}</h2>
              
              {/* Main Image Display */}
              {selectedImage && (
                <div className="mb-6 bg-black/20 backdrop-blur-xl rounded-lg overflow-hidden border border-white/30">
                  <img
                    src={selectedImage}
                    alt="Selected case image"
                    className="w-full h-96 object-contain"
                  />
                </div>
              )}

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {caseData.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-3 transition-all ${
                      selectedImage === image.url
                        ? 'border-green-400 ring-2 ring-green-400'
                        : 'border-white/40 hover:border-green-400'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Case image ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-xs text-center py-1">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Button */}
            {(caseData.status === 'pending' || caseData.status === 'failed') && (
              <div className="mt-6">
                <button
                  onClick={handleProcessCase}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-500/90 border border-orange-400/50 text-white font-bold text-lg rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-xl"
                >
                  {processing ? (
                    <>
                      <div className="relative w-6 h-6">
                        <motion.div
                          className="absolute inset-0 border-3 border-transparent border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <span>{t.caseDetail.startingProcess}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>{caseData.status === 'failed' ? t.caseDetail.retryProcessing : t.caseDetail.processAI}</span>
                    </>
                  )}
                </button>
                {processingError && (
                  <div className="mt-3 p-3 bg-red-600/80 backdrop-blur-xl border border-red-400/50 text-white rounded-lg text-sm">
                    {processingError}
                  </div>
                )}
              </div>
            )}

            {/* Processing Status */}
            {caseData.status === 'processing' && (
              <div className="mt-6 bg-blue-600/20 border-2 border-blue-400/50 backdrop-blur-2xl rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-8 h-8">
                    <motion.div
                      className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.caseDetail.processingTitle}</h4>
                    <p className="text-sm text-white/80">{t.caseDetail.aiAnalyzing}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>{t.caseDetail.downloadingImages}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>{t.caseDetail.runningAI}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>{t.caseDetail.savingResults}</span>
                  </div>
                </div>
                <p className="text-xs text-white/70 mt-4">
                  ⏱️ {t.caseDetail.autoRefresh}
                </p>
              </div>
            )}

            {/* Disease Detection Result */}
            {caseData.status === 'completed' && caseResult && (
              <div className={`mt-6 border-2 backdrop-blur-2xl rounded-lg p-6 ${
                caseResult.diseaseStatus.toLowerCase() === 'healthy rice leaf' 
                  ? 'bg-green-600/20 border-green-400/50' 
                  : 'bg-gradient-to-br from-red-600/20 to-orange-600/20 border-red-400/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border ${
                    caseResult.diseaseStatus.toLowerCase() === 'healthy rice leaf'
                      ? 'bg-green-500/80 border-green-400/50'
                      : 'bg-gradient-to-br from-red-500/80 to-orange-500/80 border-red-400/50'
                  }`}>
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{t.caseDetail.analysisComplete}</h4>
                    <p className="text-sm text-white/80">{t.caseDetail.aiResults}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 mb-4 border border-white/30">
                  <h5 className="text-sm font-semibold text-white/70 mb-2">{t.caseDetail.diseaseDetected}:</h5>
                  <p className="text-xl font-bold text-white">{caseResult.diseaseStatus}</p>
                </div>

                <div className="text-xs text-white/70 space-y-1">
                  <p>⏱️ {t.caseDetail.processingTime}: {(caseResult.processingTime / 1000).toFixed(2)}s</p>
                  <p>📅 {t.caseDetail.completed}: {formatDate(caseResult.processedAt)}</p>
                </div>
              </div>
            )}

            {/* Treatment & Insights Section - Only when disease detected (not healthy) */}
            {isDiseaseDetected() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Section Header */}
                  <div className="p-5 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/80 to-blue-500/80 flex items-center justify-center border border-purple-400/50 backdrop-blur-xl">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{t.caseDetail.treatmentInsights || 'Treatment & Insights'}</h3>
                        <p className="text-sm text-white/70">{t.caseDetail.treatmentInsightsDesc || 'AI-powered treatment recommendations for'} <span className="text-orange-300 font-semibold">{caseResult.diseaseStatus}</span></p>
                        <p className="text-sm text-white/70">{t.caseDetail.treatmentInsightsInformation || 'Click on the buttons below to generate / view detailed treatment guide, disease causes, and prevention strategies.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Three Action Buttons */}
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {/* Treatment Button */}
                    <button
                      onClick={() => {
                        if (activeTab === 'treatment') {
                          setActiveTab(null);
                        } else if (treatmentData.treatment || treatmentLoading.treatment || treatmentError.treatment) {
                          setActiveTab('treatment');
                        } else {
                          generateTreatment('treatment');
                        }
                      }}
                      disabled={false}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 border backdrop-blur-xl ${
                        activeTab === 'treatment'
                          ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400/60 shadow-lg shadow-green-500/20'
                          : treatmentData.treatment
                            ? 'bg-green-600/20 border-green-400/40 hover:bg-green-600/30'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-green-400/40'
                      } ${treatmentLoading.treatment ? 'cursor-wait' : ''}`}
                    >
                      {treatmentLoading.treatment ? (
                        <div className="relative w-8 h-8">
                          <motion.div
                            className="absolute inset-0 border-3 border-transparent border-t-green-400 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute inset-1.5 border-2 border-transparent border-t-white rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          treatmentData.treatment ? 'bg-green-500/80' : 'bg-white/20'
                        }`}>
                          <Pill className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-white text-center leading-tight">
                        {t.caseDetail.getTreatment || 'Get Treatment'}
                      </span>
                      {treatmentData.treatment && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-green-400">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Causes Button */}
                    <button
                      onClick={() => {
                        if (activeTab === 'causes') {
                          setActiveTab(null);
                        } else if (treatmentData.causes || treatmentLoading.causes || treatmentError.causes) {
                          setActiveTab('causes');
                        } else {
                          generateTreatment('causes');
                        }
                      }}
                      disabled={false}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 border backdrop-blur-xl ${
                        activeTab === 'causes'
                          ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-400/60 shadow-lg shadow-amber-500/20'
                          : treatmentData.causes
                            ? 'bg-amber-600/20 border-amber-400/40 hover:bg-amber-600/30'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-amber-400/40'
                      } ${treatmentLoading.causes ? 'cursor-wait' : ''}`}
                    >
                      {treatmentLoading.causes ? (
                        <div className="relative w-8 h-8">
                          <motion.div
                            className="absolute inset-0 border-3 border-transparent border-t-amber-400 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute inset-1.5 border-2 border-transparent border-t-white rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          treatmentData.causes ? 'bg-amber-500/80' : 'bg-white/20'
                        }`}>
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-white text-center leading-tight">
                        {t.caseDetail.getCauses || 'Causes'}
                      </span>
                      {treatmentData.causes && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-amber-400">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Prevention Button */}
                    <button
                      onClick={() => {
                        if (activeTab === 'prevention') {
                          setActiveTab(null);
                        } else if (treatmentData.prevention || treatmentLoading.prevention || treatmentError.prevention) {
                          setActiveTab('prevention');
                        } else {
                          generateTreatment('prevention');
                        }
                      }}
                      disabled={false}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 border backdrop-blur-xl ${
                        activeTab === 'prevention'
                          ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/60 shadow-lg shadow-blue-500/20'
                          : treatmentData.prevention
                            ? 'bg-blue-600/20 border-blue-400/40 hover:bg-blue-600/30'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-blue-400/40'
                      } ${treatmentLoading.prevention ? 'cursor-wait' : ''}`}
                    >
                      {treatmentLoading.prevention ? (
                        <div className="relative w-8 h-8">
                          <motion.div
                            className="absolute inset-0 border-3 border-transparent border-t-blue-400 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute inset-1.5 border-2 border-transparent border-t-white rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          treatmentData.prevention ? 'bg-blue-500/80' : 'bg-white/20'
                        }`}>
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-white text-center leading-tight">
                        {t.caseDetail.getPrevention || 'Prevention'}
                      </span>
                      {treatmentData.prevention && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-400">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Content Area */}
                  <AnimatePresence mode="wait">
                    {/* Treatment Content */}
                    {activeTab === 'treatment' && (
                      <motion.div
                        key="treatment-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-400/30 rounded-xl p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Pill className="w-5 h-5 text-green-400" />
                                <h4 className="font-bold text-green-300">{t.caseDetail.treatmentTitle || 'Treatment Guide'}</h4>
                              </div>
                              <button
                                onClick={() => setActiveTab(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                              >
                                <ChevronUp className="w-4 h-4 text-white/70" />
                              </button>
                            </div>
                            {treatmentLoading.treatment ? (
                              <div className="flex flex-col items-center gap-3 py-8">
                                <div className="relative w-12 h-12">
                                  <motion.div
                                    className="absolute inset-0 border-4 border-transparent border-t-green-400 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-2 border-3 border-transparent border-t-white rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-4 border-2 border-transparent border-t-green-300 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  />
                                </div>
                                <p className="text-sm text-white/80">{t.caseDetail.generatingTreatment || 'Generating treatment guide...'}</p>
                              </div>
                            ) : treatmentError.treatment ? (
                              <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span className="text-red-300 font-semibold text-sm">{t.caseDetail.treatmentError || 'Failed to generate'}</span>
                                </div>
                                {/* <p className="text-white/80 text-sm mb-3">{treatmentError.treatment}</p> */}
                                <button
                                  onClick={() => retryTreatment('treatment')}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors border border-red-400/50"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {t.caseDetail.retryGenerate || 'Retry'}
                                </button>
                              </div>
                            ) : treatmentData.treatment ? (
                              <div>
                                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                  {renderMarkdown(treatmentData.treatment.content)}
                                </div>
                                {(treatmentData.treatment.generatedAt || treatmentData.treatment.createdAt) && (
                                  <div className="mt-3 pt-3 border-t border-green-400/20 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-green-400/70 flex-shrink-0" />
                                    <span className="text-xs text-green-300/70">
                                      {t.caseDetail.generatedOn || 'Generated on'} {formatDateWithSeconds(treatmentData.treatment.generatedAt || treatmentData.treatment.createdAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Causes Content */}
                    {activeTab === 'causes' && (
                      <motion.div
                        key="causes-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-400/30 rounded-xl p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                                <h4 className="font-bold text-amber-300">{t.caseDetail.causesTitle || 'Disease Causes'}</h4>
                              </div>
                              <button
                                onClick={() => setActiveTab(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                              >
                                <ChevronUp className="w-4 h-4 text-white/70" />
                              </button>
                            </div>
                            {treatmentLoading.causes ? (
                              <div className="flex flex-col items-center gap-3 py-8">
                                <div className="relative w-12 h-12">
                                  <motion.div
                                    className="absolute inset-0 border-4 border-transparent border-t-amber-400 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-2 border-3 border-transparent border-t-white rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-4 border-2 border-transparent border-t-amber-300 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  />
                                </div>
                                <p className="text-sm text-white/80">{t.caseDetail.generatingCauses || 'Analyzing disease causes...'}</p>
                              </div>
                            ) : treatmentError.causes ? (
                              <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span className="text-red-300 font-semibold text-sm">{t.caseDetail.causesError || 'Failed to generate'}</span>
                                </div>
                                {/* <p className="text-white/80 text-sm mb-3">{treatmentError.causes}</p> */}
                                <button
                                  onClick={() => retryTreatment('causes')}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors border border-red-400/50"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {t.caseDetail.retryGenerate || 'Retry'}
                                </button>
                              </div>
                            ) : treatmentData.causes ? (
                              <div>
                                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                  {renderMarkdown(treatmentData.causes.content)}
                                </div>
                                {(treatmentData.causes.generatedAt || treatmentData.causes.createdAt) && (
                                  <div className="mt-3 pt-3 border-t border-amber-400/20 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                                    <span className="text-xs text-amber-300/70">
                                      {t.caseDetail.generatedOn || 'Generated on'} {formatDateWithSeconds(treatmentData.causes.generatedAt || treatmentData.causes.createdAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Prevention Content */}
                    {activeTab === 'prevention' && (
                      <motion.div
                        key="prevention-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-400/30 rounded-xl p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <h4 className="font-bold text-blue-300">{t.caseDetail.preventionTitle || 'Prevention Strategies'}</h4>
                              </div>
                              <button
                                onClick={() => setActiveTab(null)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                              >
                                <ChevronUp className="w-4 h-4 text-white/70" />
                              </button>
                            </div>
                            {treatmentLoading.prevention ? (
                              <div className="flex flex-col items-center gap-3 py-8">
                                <div className="relative w-12 h-12">
                                  <motion.div
                                    className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-2 border-3 border-transparent border-t-white rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  />
                                  <motion.div
                                    className="absolute inset-4 border-2 border-transparent border-t-blue-300 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                  />
                                </div>
                                <p className="text-sm text-white/80">{t.caseDetail.generatingPrevention || 'Generating prevention strategies...'}</p>
                              </div>
                            ) : treatmentError.prevention ? (
                              <div className="bg-red-600/20 border border-red-400/40 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span className="text-red-300 font-semibold text-sm">{t.caseDetail.preventionError || 'Failed to generate'}</span>
                                </div>
                                {/* <p className="text-white/80 text-sm mb-3">{treatmentError.prevention}</p> */}
                                <button
                                  onClick={() => retryTreatment('prevention')}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors border border-red-400/50"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {t.caseDetail.retryGenerate || 'Retry'}
                                </button>
                              </div>
                            ) : treatmentData.prevention ? (
                              <div>
                                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                  {renderMarkdown(treatmentData.prevention.content)}
                                </div>
                                {(treatmentData.prevention.generatedAt || treatmentData.prevention.createdAt) && (
                                  <div className="mt-3 pt-3 border-t border-blue-400/20 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-blue-400/70 flex-shrink-0" />
                                    <span className="text-xs text-blue-300/70">
                                      {t.caseDetail.generatedOn || 'Generated on'} {formatDateWithSeconds(treatmentData.prevention.generatedAt || treatmentData.prevention.createdAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Save Report Button */}
                  <div className="px-4 pb-4 pt-7">
                    <div className="relative flex flex-col lg:block gap-3">
                      {!allSectionsFetched && (
                        <div className="relative lg:absolute lg:-top-1 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-full lg:mb-1 lg:w-max lg:px-3 lg:py-1.5 lg:text-xs lg:text-white/80 lg:bg-transparent lg:shadow-none lg:pointer-events-none lg:z-10 w-full px-4 py-2.5 text-xs sm:text-sm text-white/90 text-center bg-black/20 shadow-inner backdrop-blur-xl border border-white/20 rounded-lg">
                          {t.generateReport.information || 'Please generate all the above 3 sections to enable report download and Ask VeAg'}
                        </div>
                      )}
                      <button
                        onClick={generateReport}
                        disabled={!allSectionsFetched || reportGenerating}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border backdrop-blur-xl ${
                          allSectionsFetched && !reportGenerating
                            ? 'bg-gradient-to-r from-emerald-600 to-green-500 border-emerald-400/60 text-white hover:from-emerald-500 hover:to-green-400 shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95'
                            : reportGenerating
                              ? 'bg-gradient-to-r from-emerald-700 to-green-600 border-emerald-500/50 text-white cursor-wait'
                              : 'bg-white/5 border-white/15 text-white/35 cursor-not-allowed'
                        }`}
                      >
                        {reportGenerating ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>{t.generateReport.generatingReport || 'Generating Report...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>{t.generateReport.saveReport || 'Save Report'}</span>
                            {allSectionsFetched && (
                              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">PDF</span>
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {caseData.status === 'failed' && (
              <div className="mt-6 bg-red-600/20 border-2 border-red-400/50 backdrop-blur-2xl rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center backdrop-blur-xl border border-red-400/50">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{t.caseDetail.processingFailed}</h4>
                    <p className="text-sm text-white/80">{t.caseDetail.errorOccurred}</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 mb-4">
                  {t.caseDetail.failedMessage}
                </p>
                <button
                  onClick={handleProcessCase}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-red-500/80 text-white font-semibold rounded-lg hover:bg-red-500 disabled:opacity-50 transition-colors border border-red-400/50 backdrop-blur-xl"
                >
                  {processing ? t.caseDetail.retrying : t.caseDetail.retryProcessing}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Case Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Crop Information */}
            <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{t.caseDetail.cropInformation}</h3>
              <div className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-400/30 backdrop-blur-xl rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 21C12 10 20 4 20 4S10 4 10 14c0 4 2 7 2 7zm0 0C12 14 4 10 4 10s2 8 8 11z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-white/70">{t.caseDetail.cropType}</p>
                  <p className="text-lg font-bold text-white capitalize">{caseData.cropName}</p>
                </div>
              </div>
            </div>

            {/* Disease Observation */}
            {caseData.diseaseObservation && (
              <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">{t.caseDetail.observation}</h3>
                <p className="text-white/90 leading-relaxed">{caseData.diseaseObservation}</p>
              </div>
            )}

            {/* Case Statistics */}
            <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{t.caseDetail.caseStats}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70">{t.caseDetail.totalImages}</span>
                  <span className="font-semibold text-white">{caseData.images.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70">{t.caseDetail.status}</span>
                  <span className="font-semibold text-white capitalize">{caseData.status}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/70">{t.caseDetail.caseId}</span>
                  <span className="font-semibold text-white">{caseData.caseId}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{t.caseDetail.actions}</h3>
              <div className="space-y-3">
                {/* Ask VeAg Button - only when disease detected and treatment completed */}
                {allSectionsFetched && isDiseaseDetected() && (
                  <button
                    onClick={() => setShowAskVeAg(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500/80 to-orange-600/80 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-600 transition-all border border-green-400/50 backdrop-blur-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t.caseDetail.askVeAg || 'Ask VeAg'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/manage-cases')}
                  className="w-full px-4 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
                >
                  {t.caseDetail.viewAllCases}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-3 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
                >
                  {t.caseDetail.goToDashboard}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask VeAg Chat Window */}
      <AskVeAg
        isOpen={showAskVeAg}
        onClose={() => setShowAskVeAg(false)}
        caseId={caseId}
        userId={currentUser?.userId}
        diseaseName={caseResult?.diseaseStatus || ''}
        t={t}
      />
    </div>
  );
};

export default withSubscription(CaseDetail);
