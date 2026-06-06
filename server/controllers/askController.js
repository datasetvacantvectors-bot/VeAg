import AskChat from '../models/AskChat.js';
import Case from '../models/Case.js';
import CaseResult from '../models/CaseResult.js';
import geminiService from '../services/geminiService.js';

const BATCH_SIZE = 20;

// Get chat messages for a case (paginated, newest first)
export const getMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { before, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. Access denied.' });
    }

    // Verify case belongs to user
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc || caseDoc.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const query = { caseId, userId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await AskChat.find(query)
      .sort({ createdAt: -1 })
      .limit(BATCH_SIZE)
      .lean();

    // Return in chronological order
    messages.reverse();

    const hasMore = messages.length === BATCH_SIZE;

    res.json({
      success: true,
      messages,
      hasMore
    });
  } catch (error) {
    // console.error('Error fetching ask messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a question
export const sendMessage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. Access denied.' });
    }

    // Validate text-only (no HTML, no URLs with scripts)
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Only text messages are allowed' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message too long. Maximum 2000 characters.' });
    }

    // Verify case belongs to user
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc || caseDoc.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify case has completed analysis with a disease
    if (caseDoc.status !== 'completed') {
      return res.status(400).json({ error: 'Case analysis not completed yet' });
    }

    const caseResult = await CaseResult.findOne({ caseId });
    if (!caseResult) {
      return res.status(400).json({ error: 'No analysis result found' });
    }

    const diseaseName = caseResult.diseaseStatus;
    if (diseaseName.toLowerCase().includes('healthy')) {
      return res.status(400).json({ error: 'No disease detected for this case' });
    }

    // Create the chat message in "sent" status
    const chatMsg = new AskChat({
      caseId,
      userId,
      diseaseName,
      message: message.trim(),
      status: 'sent'
    });
    await chatMsg.save();

    // Update to analyzing
    chatMsg.status = 'analyzing';
    await chatMsg.save();

    // Generate AI response
    try {
      const result = await geminiService.generateAskResponse(diseaseName, message.trim());

      if (result.success) {
        chatMsg.reply = result.content;
        chatMsg.status = 'answered';
      } else {
        chatMsg.reply = result.content || 'Sorry, I could not process your question. Please try again.';
        chatMsg.status = 'failed';
      }
    } catch (aiError) {
    //   console.error('AI response error:', aiError);
      chatMsg.reply = 'Sorry, something went wrong. Please try again later.';
      chatMsg.status = 'failed';
    }

    await chatMsg.save();

    res.json({
      success: true,
      message: chatMsg
    });
  } catch (error) {
    // console.error('Error sending ask message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Retry a failed message
export const retryMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. Access denied.' });
    }

    const chatMsg = await AskChat.findById(messageId);
    if (!chatMsg || chatMsg.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (chatMsg.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed messages can be retried' });
    }

    chatMsg.status = 'analyzing';
    await chatMsg.save();

    try {
      const result = await geminiService.generateAskResponse(chatMsg.diseaseName, chatMsg.message);

      if (result.success) {
        chatMsg.reply = result.content;
        chatMsg.status = 'answered';
      } else {
        chatMsg.reply = result.content || 'Sorry, I could not process your question. Please try again.';
        chatMsg.status = 'failed';
      }
    } catch (aiError) {
    //   console.error('AI retry error:', aiError);
      chatMsg.reply = 'Sorry, something went wrong. Please try again later.';
      chatMsg.status = 'failed';
    }

    await chatMsg.save();

    res.json({
      success: true,
      message: chatMsg
    });
  } catch (error) {
    // console.error('Error retrying message:', error);
    res.status(500).json({ error: 'Failed to retry message' });
  }
};
