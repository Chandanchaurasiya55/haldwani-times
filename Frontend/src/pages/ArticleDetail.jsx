import React, { useState, useEffect } from 'react';
import { parseLiveTitle } from '../utils/liveUtils';

function ArticleDetail({ article, onClose, onSelectArticle, allArticles }) {
  const [commentInput, setCommentInput] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [hindiSummary, setHindiSummary] = useState('');
  const [hindiParagraphs, setHindiParagraphs] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Marcus Thorne',
      time: '2h ago',
      content: 'Highly relevant reporting. Staying up to date on these local developments with proper source tracking makes this aggregator extremely useful.',
      likes: 42
    },
    {
      id: 2,
      author: 'Lina Zhang',
      time: '45m ago',
      content: 'Completely agree. Good to have the historical context and original source links preserved. Clean presentation!',
      likes: 12
    }
  ]);

  // Google Translate helper
  const translateToHindi = async (text) => {
    if (!text || !text.trim()) return text;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return text;
      const data = await res.json();
      return data[0]?.map(chunk => chunk[0]).join('') || text;
    } catch {
      return text;
    }
  };

  // Scroll to top on mount or when article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article]);

  // Translate article content to Hindi
  useEffect(() => {
    if (!article) return;
    setIsTranslating(true);
    setHindiTitle('');
    setHindiSummary('');
    setHindiParagraphs([]);

    (async () => {
      try {
        const [tTitle, tSummary] = await Promise.all([
          translateToHindi(article.title),
          translateToHindi(article.summary ? article.summary.slice(0, 400) : '')
        ]);
        setHindiTitle(tTitle);
        setHindiSummary(tSummary);

        // Get enriched paragraphs and translate them
        const enriched = getEnrichedParagraphs(article.title, article.category, article.summary);
        const translatedParas = [];
        for (const para of enriched) {
          if (para && para.isQuote) {
            const tText = await translateToHindi(para.text);
            translatedParas.push({ isQuote: true, text: tText });
          } else if (typeof para === 'string') {
            // Translate in chunks to avoid URL length limits
            const chunks = para.match(/.{1,500}/gs) || [para];
            const translated = [];
            for (const chunk of chunks) {
              translated.push(await translateToHindi(chunk));
            }
            translatedParas.push(translated.join(''));
          } else {
            translatedParas.push(para);
          }
        }
        setHindiParagraphs(translatedParas);
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);
  if (!article) return null;

  // Get enriched paragraphs to show more content if the original description is short
  const getEnrichedParagraphs = (title, category, content) => {
    const origPara = content ? content.trim() : '';
    const catLower = (category || '').toLowerCase();
    
    // Choose specific text content based on category
    let introExtension = "";
    let backgroundText = "";
    let quote1 = "";
    let responseText = "";
    let techDeepDive = "";
    let quote2 = "";
    let outlookText = "";

    if (catLower.includes('uttarakhand') || catLower.includes('local')) {
      introExtension = `Following the initial announcements regarding "${title}", administrative teams in Haldwani and Dehradun have mobilized regional resources to evaluate the immediate operational framework. Citizens and local organizations are actively seeking updates as the state cabinet drafts the implementation roadmap. This development is expected to have a major bearing on the regional socio-economic landscape, particularly in the Kumaon region where infrastructure and public utility demands are scaling rapidly. Authorities have highlighted that the primary focus will remain on keeping local governance channels clear, transparent, and fully accessible to the public during this transitional phase.`;

      backgroundText = `To understand the significance of this development, it is essential to look at the historical context of Uttarakhand’s regional policies. Over the last decade, cities like Haldwani, Dehradun, and Haridwar have witnessed massive population growth, which has put unprecedented pressure on administrative, educational, and public utility setups. Previous attempts to reform these structures were met with logistical challenges and implementation bottlenecks. The current initiative marks a departure from historical precedents by utilizing direct local feedback and modern digital channels to streamline public operations. Regional experts suggest that integrating Haldwani into the broader state developmental plans will address long-standing gaps in public services.`;

      quote1 = `“The unique topography and regional requirements of Uttarakhand demand localized planning. We cannot apply a single blueprint to every district; we must adapt our policies to match the realities of the Kumaon and Garhwal regions.”`;

      responseText = `The public response in Haldwani has been a mix of optimism and concern. Local business unions, environmental groups, and resident associations have convened several town hall meetings to discuss the potential impacts. While many welcome the promise of improved services and infrastructure support, others emphasize the need for stringent environmental assessments and fair allocation of municipal resources. Community representatives have submitted a formal memorandum to the district magistrate, urging the state cabinet to involve local stakeholders in all upcoming policy discussions and development phases.`;

      techDeepDive = `On a technical level, the project involves a multi-layered implementation strategy. The state treasury has reportedly allocated a separate fund to initiate the first phase of public works and municipal modernization in Haldwani. This includes the digitization of municipal records, construction of state-of-the-art administrative facilities, and training of local officials to handle the modernized public interface. Experts warn that the primary bottleneck will be integrating legacy data setups with the new digital framework, a process that requires expert software auditing and comprehensive testing to prevent operational downtime.`;

      quote2 = `“Modernizing Haldwani’s administrative infrastructure is a monumental task. The success of this transition relies entirely on public-private cooperation and transparency in resource distribution.”`;

      outlookText = `Looking ahead, the district administration plans to roll out the initial phases of the new operational model over the next three months. A dedicated public help desk and a feedback portal will be established at the Haldwani municipal commissioner's office to resolve citizen queries in real-time. State representatives have scheduled a progress review session in Dehradun next month to monitor the first set of deliverables. Haldwani Times will continue to provide on-the-ground reporting, ensuring you stay updated on every phase of this regional transformation.`;

    } else if (catLower.includes('politics')) {
      introExtension = `The latest updates regarding "${title}" have triggered intense discussions across major political circles in New Delhi and state capitals. Key legislative leaders and political spokespersons have issued statements to clarify their party stands. As debate gains momentum in parliament and regional assemblies, stakeholders are closely analyzing the potential electoral and policy impacts of these announcements. Analysts suggest that this represents a major strategic move that could redefine party alliances and legislative priorities in the upcoming session, making it a critical watchpoint for observers.`;

      backgroundText = `Political historians note that the current debate is the culmination of years of legislative negotiation and ideological differences between major political coalitions. For decades, policies governing this sector have been subject to intense debates, with each administration attempting to stamp its own vision on national guidelines. The current gridlock arises from competing priorities: one faction argues for centralized control and national standardization, while the opposing coalition champions state autonomy and localized execution. This debate highlights the complex federation dynamics of modern India, where regional aspirations must be balanced against national directives.`;

      quote1 = `“True governance is not about winning debates; it is about delivering policies that empower the common citizen. We must rise above partisan interests to build a sustainable national framework.”`;

      responseText = `Public feedback has been highly polarized, reflecting the deep divisions in the political landscape. Civil society organizations and independent watchdogs have called for public discussions and open-panel debates before the proposed bill is put to a vote. Citizens have taken to digital forums to express their opinions, with trending discussions highlighting concerns over policy transparency and public accountability. Political commentators warn that rushing the legislation without building a broad consensus could lead to widespread protests and legal challenges in the higher courts.`;

      techDeepDive = `The administrative machinery required to execute this political directive is immense. It involves coordinating operations across multiple central ministries, state departments, and municipal corporations. A joint parliamentary committee has been proposed to oversee the budget allocation and define the scope of executive power under the new rules. Legal experts are also drafting a comprehensive regulatory framework to address potential conflicts of interest and ensure that all administrative actions remain fully compliant with constitutional guidelines and established judicial precedents.`;

      quote2 = `“The structural complexity of this policy demands rigorous judicial and parliamentary oversight. Any oversight in the draft phase could lead to operational paralysis at the executive level.”`;

      outlookText = `As the legislative session approaches, political parties are gearing up for a high-stakes showdown on the floor of the house. The government is expected to introduce the final draft of the bill next week, followed by a detailed debate and voting process. Haldwani Times will bring you live updates, expert political analysis, and exclusive interviews with key policymakers as this national story continues to unfold.`;

    } else if (catLower.includes('business')) {
      introExtension = `The financial markets and industrial sectors are reacting sharply to "${title}". Trade bodies, chambers of commerce, and financial analysts have released comprehensive market updates to assess the economic implications of this announcement. Investors are keeping a close watch on stock indices and currency fluctuations as corporate boards convene to align their strategies with the new economic guidelines. Economists suggest that this development will introduce fresh investment dynamics, affecting both domestic capital allocation and foreign direct investment patterns.`;

      backgroundText = `The economic context surrounding this development is shaped by post-reform adjustments and global market trends. Over the past few quarters, the Indian business ecosystem has been navigating shifting interest rates, supply chain challenges, and regulatory changes. Historically, similar policy shifts have led to temporary market consolidation followed by long-term capacity building. Financial experts point out that the success of this measure will depend on how quickly corporate entities adapt their supply chains and pricing structures to the modernized regulatory requirements.`;

      quote1 = `“Economic growth is driven by regulatory clarity and ease of doing business. This announcement provides the necessary framework for enterprises to plan long-term investments with confidence.”`;

      responseText = `Corporate leaders have generally welcomed the policy update, noting that it addresses several long-standing demands regarding business compliance and credit accessibility. However, small and medium enterprises (SMEs) have voiced concerns over the initial compliance costs and the technological transition required to integrate with the new digital tax and trade portals. Industry representatives have urged the finance ministry to establish support centers and offer tax credits to ease the transition for smaller business units.`;

      techDeepDive = `From a technical standpoint, the business reforms will be supported by a state-of-the-art digital infrastructure. The Ministry of Corporate Affairs and the GST Council are reportedly upgrading their cloud servers to handle the increased volume of online filings. The new system integrates artificial intelligence to detect compliance anomalies and accelerate approvals. However, software security experts have raised flags regarding data privacy and the protection of proprietary business information, demanding strict encryption protocols.`;

      quote2 = `“A robust digital framework is the backbone of modern business. We must ensure that our infrastructure upgrades are accompanied by top-tier cybersecurity measures.”`;

      outlookText = `In the coming weeks, financial regulators are expected to issue detailed circulars outlining the phase-wise implementation schedule for corporate entities. Market watchdogs will continue to track compliance rates and index reactions. Haldwani Times' financial desk will monitor these updates closely, providing you with daily market summaries and expert columns on how these economic changes impact your personal finance and investments.`;

    } else if (catLower.includes('education')) {
      introExtension = `The latest updates regarding "${title}" have created significant interest among students, educators, and academic boards nationwide. Academic councils and university senates are convening emergency meetings to evaluate the curriculum revisions and examination guidelines. As educational institutions prepare for the upcoming academic session, parents and student bodies are actively seeking clarification on admission criteria and scholarship allocations, making it one of the most discussed topics in the academic community.`;

      backgroundText = `To understand the impact of these changes, one must analyze the evolution of India's national education policies. Over the years, there has been a growing demand to bridge the gap between rote learning and industry-relevant skills. Academic reforms, however, have historically faced challenges due to regional differences in infrastructure and varying teacher training standards. The current curriculum overhaul aims to address these issues by introducing mandatory vocational courses, digital literacy modules, and flexible credit systems, aligning regional boards with international standards.`;

      quote1 = `“Education must evolve to meet the challenges of the modern digital economy. We must empower our students with critical thinking and problem-solving skills rather than rote memory.”`;

      responseText = `The student community and teacher unions have responded with a mix of enthusiasm and caution. While many welcome the focus on modern subjects like programming and data analysis, educator associations have raised concerns regarding the readiness of public school infrastructure, particularly in rural and semi-urban districts. Representatives have requested the state education department to conduct comprehensive teacher-training workshops and allocate additional funds for computer labs before enforcing the new syllabus.`;

      techDeepDive = `The implementation plan involves deploying a centralized digital education portal that will host open-source study materials, online lectures, and digital assessment tools. The platform is designed to support regional languages to ensure accessibility for all students. Technical analysts point out that maintaining server uptime during peak exam registration periods will require significant load-balancing upgrades. Security audits are also underway to protect student personal data and maintain the integrity of online exams.`;

      quote2 = `“A successful educational transition requires more than updating text-books. We must invest in our teachers and school infrastructure to make these reforms meaningful on the ground.”`;

      outlookText = `The state academic council is scheduled to release the final implementation guidelines and model question papers by the end of this month. Schools and colleges will begin the transition process in the next academic term. Haldwani Times will continue to track these educational updates, bringing you expert opinions, student features, and detailed guides to help you navigate the new academic structure.`;

    } else if (catLower.includes('food')) {
      introExtension = `The culinary community and hospitality sectors are abuzz with updates concerning "${title}". Renowned chefs, restaurateurs, and food critics are actively discussing the culinary trends, local agricultural impact, and heritage recipes highlighted in this announcement. As Haldwani and the broader Kumaon region witness a surge in culinary tourism, local establishments are updating their menus and sourcing strategies to celebrate the rich gastronomical culture of Uttarakhand, capturing the attention of food lovers nationwide.`;

      backgroundText = `The culinary heritage of Uttarakhand, particularly the Kumaoni cuisine, is deeply rooted in local agriculture and traditional cooking methods. Historically, dishes like Bhaang ki Chutney, Kafuli, and Chainsoo were prepared using locally sourced, organic ingredients cooked over slow wood fires. Over the years, urbanization led to a decline in the availability of traditional ingredients. The current revival movement aims to document and preserve these recipes, connecting local farmers directly with premium restaurants and hotels to create a sustainable farm-to-table culinary ecosystem.`;

      quote1 = `“Food is the mirror of our culture and geography. Preserving our traditional culinary practices is essential to keeping our regional identity and agricultural heritage alive.”`;

      responseText = `Local farmers and hospitality associations have reacted positively to the initiative. Farmers' cooperatives in the Kumaon hills report a steady rise in demand for local grains and spices like Mandua, Jhangora, and Jakhiya. Restaurant owners in Haldwani have expressed excitement about incorporating traditional dishes into their menus, noting that travelers are increasingly seeking authentic regional dining experiences. However, they highlight the challenge of maintaining a consistent supply of seasonal organic ingredients.`;

      techDeepDive = `To support this farm-to-table initiative, local authorities are establishing cold-storage facilities and dedicated transport corridors connecting remote Kumaoni villages with urban markets in Haldwani. A digital catalog is also being developed to document GI-tagged agricultural products from Uttarakhand. This platform will enable chefs and bulk buyers to verify the authenticity and origin of ingredients, ensuring fair pricing and preventing exploitation by middle-men.`;

      quote2 = `“A sustainable food culture relies on supporting the small farmers who cultivate our land. The farm-to-table model is key to both culinary excellence and agricultural survival.”`;

      outlookText = `Several food festivals and agricultural showcases are planned in Haldwani, Nainital, and Bhimtal over the coming months. These events will offer cooking masterclasses, organic produce markets, and regional food tastings. Haldwani Times' lifestyle and food desk will cover these events live, bringing you exclusive chef interviews, recipe guides, and food reviews.`;

    } else {
      // General / National / World category detailed templates
      introExtension = `In light of the recent announcements regarding "${title}", national and international observers are assessing the strategic and operational implications. Experts from various fields have begun publishing research papers, analysis updates, and public commentary on the subject. As the global community evaluates the timelines and execution roadmap, public interest remains exceptionally high. The development is expected to introduce fresh dynamics to the sector, influencing standard operating procedures and strategic planning frameworks across multiple organizations.`;

      backgroundText = `The historical background of this issue reveals a complex web of regulatory challenges, technological evolutions, and shifting public expectations. Over the last two decades, rapid globalization and digital transformation have altered how organizations approach these situations. Previous models relied on slow, manual intervention, which often proved inadequate during crises. The current framework represents a major step forward, leveraging real-time data analytics, collaborative networks, and modern administrative guidelines to address challenges more dynamically and transparently.`;

      quote1 = `“Operational efficiency and strategic agility are the key pillars of modern institutional planning. We must continuously refine our methodologies to stay ahead of global standards.”`;

      responseText = `The public and industry response has been highly engaged, with webinars and analytical forums being organized to dissect the policy changes. Public interest groups have called for transparency and clear guidelines, urging decision-makers to address potential gaps in the transition plan. Many stakeholders agree that the long-term benefits are substantial, though they warn that the initial integration phase will require careful management, clear communication, and ongoing support for affected teams.`;

      techDeepDive = `The execution of this policy is backed by a robust technical framework designed to optimize resource allocation and ensure compliance. This includes the deployment of secure databases, real-time tracking dashboards, and automated verification tools. System audits are being conducted to identify potential security vulnerabilities and ensure complete data integrity. Technicians are also developing training programs to help administrators transition smoothly to the new system, minimizing operational disruptions.`;

      quote2 = `“The integration of advanced tech with public policy requires careful planning and constant monitoring. We must prioritize security and user accessibility at every stage of the rollout.”`;

      outlookText = `Detailed implementation guidelines and operational circulars are expected to be released next month. A dedicated task force has been appointed to monitor progress and address implementation bottlenecks in real-time. Haldwani Times will continue to track these global and national developments, providing you with comprehensive analysis, expert opinions, and regular updates to help you stay ahead of the curve.`;
    }

    const firstSection = `${origPara} ${introExtension}`;
    const paragraphsList = [
      firstSection,
      backgroundText,
      { isQuote: true, text: quote1 },
      responseText,
      techDeepDive,
      { isQuote: true, text: quote2 },
      outlookText
    ];

    return paragraphsList;
  };

  const enrichedParagraphs = hindiParagraphs.length > 0 ? hindiParagraphs : getEnrichedParagraphs(article.title, article.category, article.summary);
  const displayTitle = hindiTitle || article.title;
  const displaySummary = hindiSummary || article.summary;

  const liveData = parseLiveTitle(displayTitle);
  const isHindi = !!hindiTitle;

  const getTimelineTime = (index, isHindi) => {
    if (isHindi) {
      if (index === 0) return 'अभी-अभी';
      if (index === 1) return '15 मिनट पहले';
      if (index === 2) return '1 घंटा पहले';
      if (index === 3) return '2 घंटे पहले';
      return `${index + 1} घंटे पहले`;
    } else {
      if (index === 0) return 'Just now';
      if (index === 1) return '15 mins ago';
      if (index === 2) return '1 hour ago';
      if (index === 3) return '2 hours ago';
      return `${index + 1} hours ago`;
    }
  };

  const getHeadlineDescription = (headline, index, category, isHindi) => {
    const cat = (category || '').toLowerCase();
    
    if (isHindi) {
      if (cat.includes('uttarakhand') || cat.includes('local') || cat.includes('hindi')) {
        if (index === 0) {
          return `इस संबंध में उत्तराखंड शासन और जिला प्रशासन की एक महत्वपूर्ण बैठक आयोजित की गई है। कुमाऊं क्षेत्र के विकास और सुरक्षा प्रबंधों को लेकर कड़े निर्देश जारी किए गए हैं। हल्द्वानी और देहरादून के बीच विकास कार्यों के समन्वय को लेकर एक नोडल अधिकारी भी नियुक्त किया गया है।`;
        }
        if (index === 1) {
          return `राजकीय एजेंसियों ने तत्काल प्रभाव से कार्यों को पूरा करने की रूपरेखा तैयार कर ली है। स्थानीय जनप्रतिनिधियों ने इस पहल का स्वागत करते हुए कहा है कि इससे क्षेत्र में लंबे समय से लंबित पड़ी समस्याओं का त्वरित समाधान होगा।`;
        }
        if (index === 2) {
          return `क्षेत्रीय नागरिकों और व्यापार मंडल के सदस्यों ने प्रशासन से सहयोग करने की अपील की है। हल्द्वानी टाइम्स की टीम ग्राउंड रिपोर्टिंग के जरिए इस योजना के एक-एक पहलू पर बारीकी से नजर बनाए रखेगी।`;
        }
        return `प्रशासनिक अधिकारियों ने इस प्रक्रिया को पारदर्शी बनाने के लिए साप्ताहिक प्रगति विवरण साझा करने का आश्वासन दिया है। इस पहल से कुमाऊं की बुनियादी ढांचागत विकास को एक नया आयाम मिलेगा।`;
      }
      
      if (cat.includes('politics')) {
        if (index === 0) {
          return `राजनीतिक गलियारों में इस खबर के आने के बाद हलचल काफी तेज हो गई है। विभिन्न राजनीतिक दलों के प्रवक्ताओं ने प्रेस कॉन्फ्रेंस बुलाकर अपनी प्रतिक्रियाएं दर्ज कराई हैं।`;
        }
        if (index === 1) {
          return `संसद और विधानसभाओं में इस मुद्दे को लेकर तीखी बहस की संभावना जताई जा रही है। जनता के बीच भी नीतिगत पारदर्शिता और जवाबदेही को लेकर गहन चर्चाएं छिड़ गई हैं।`;
        }
        return `राजनीतिक रूप से यह निर्णय सत्ता और विपक्ष दोनों के लिए एक परीक्षा की तरह है। आने वाले दिनों में इस पर राजनीतिक माहौल और भी गरमाने की उम्मीद है।`;
      }

      if (cat.includes('business')) {
        if (index === 0) {
          return `घरेलू बाजार में इस खबर के बाद से निवेशकों का भरोसा बढ़ा है। कॉरपोरेट घरानों और स्टार्टअप्स ने कर सुधारों और वित्तीय नियमों में इस बदलाव का स्वागत किया है।`;
        }
        return `वाणिज्य मंत्रालयों द्वारा जारी ताजा आकड़ों के अनुसार, इस फैसले से देश की आर्थिक संवृद्धि को नया बल मिलेगा और विदेशी प्रत्यक्ष निवेश में भी तेजी आएगी।`;
      }
      
      return `इस खबर से संबंधित मंत्रालयों के अधिकारियों ने समीक्षा बैठक बुलाई है। इस योजना के सफल क्रियान्वयन को सुनिश्चित करने के लिए सभी आवश्यक तैयारियां पूरी कर ली गई हैं।`;

    } else {
      if (cat.includes('uttarakhand') || cat.includes('local')) {
        if (index === 0) {
          return `State authorities in Uttarakhand have coordinated a response protocol. Senior administrators are auditing resources in Haldwani and Dehradun to establish clear support lines for this regional initiative.`;
        }
        if (index === 1) {
          return `Local organizations and municipal councils have welcomed this progress, emphasizing the need to resolve infrastructure bottlenecks quickly.`;
        }
        return `Citizens and municipal planners are organizing community feedback forums to ensure local suggestions are incorporated into the final layout.`;
      }

      if (cat.includes('politics')) {
        if (index === 0) {
          return `This announcement has triggered intense debates across parliamentary committees. Strategic policymakers are evaluating long-term impacts on public governance.`;
        }
        return `Political parties have issued official releases outlining their respective policy views. Observers predict structural changes in local legislative representation.`;
      }

      return `Administrative agencies are analyzing the logistics required to execute these directives. Progress updates are scheduled to be released sequentially by official spokespersons.`;
    }
  };

  // Find related articles (same category or type, excluding current article)
  const related = allArticles
    .filter(art => art.id !== article.id && (art.type === article.type || art.category === article.category))
    .slice(0, 3);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: Date.now(),
      author: 'Guest Reader',
      time: 'Just now',
      content: commentInput.trim(),
      likes: 0
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput('');
  };

  const handleLikeComment = (commentId) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Oct 24, 2024';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Oct 24, 2024';
    }
  };

  return (
    <div className="w-full pt-[148px] pb-16 md:pb-24 bg-background font-body-md text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      
      {/* Navigation / Back Button */}
      <div className="w-full px-4 md:px-12 mb-4 md:mb-6">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-on-surface hover:text-primary transition-all font-bold tracking-wider text-xs md:text-sm bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-full shadow-sm hover:shadow border border-outline-variant/10 group cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span>वापस जाएं</span>
        </button>
      </div>

      {/* Hero Section */}
      <header className="w-full relative h-[240px] sm:h-[360px] md:h-[480px] lg:h-[614px] overflow-hidden group md:rounded-3xl shadow-sm border border-outline-variant/10">
        <img 
          className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out" 
          src={article.image} 
          alt={article.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 lg:p-12 max-w-4xl">
          <nav className="flex items-center gap-2 mb-2 md:mb-4 font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">
            <span>{article.type}</span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            <span>{article.category.split('/')[1] || article.category}</span>
          </nav>
          <h1 className="font-display-hero text-headline-lg-mobile md:text-display-hero text-on-surface leading-tight mb-6 flex flex-wrap items-center gap-3">
            {liveData && (
              <span className="inline-flex items-center gap-1.5 bg-[#ba1a1a] text-white px-3 py-1 text-xs md:text-sm rounded-full font-bold uppercase tracking-wider animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
              </span>
            )}
            <span>{liveData ? liveData.prefix : displayTitle}</span>
          </h1>
        </div>
      </header>

      {/* Article Container */}
      <div className="w-full px-4 md:px-12 -mt-8 relative z-10">
        
        {/* Article Content Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-12 editorial-shadow border border-outline-variant/10">
          
          {/* Meta Info & Share */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-outline-variant/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary border border-outline-variant/30 uppercase select-none ring-2 ring-primary/10">
                {(article.sourceName || article.author || 'HT').slice(0, 2)}
              </div>
              <div>
                <p className="font-headline-md text-metadata text-on-surface font-bold">{article.sourceName || article.author}</p>
                <div className="flex items-center gap-2 font-metadata text-[12px] text-on-surface-variant">
                  <span>हल्द्वानी टाइम्स द्वारा संकलित</span>
                  <span className="w-1 h-1 bg-outline rounded-full"></span>
                  <span>{formatDate(article.createdAt)}</span>
                  <span className="w-1 h-1 bg-outline rounded-full"></span>
                  <span className="text-primary font-bold">5 मिनट पढ़ें</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {article.sourceUrl && (
                <a 
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps flex items-center gap-2 hover:opacity-90 transition-all font-bold"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  <span>स्रोत देखें</span>
                </a>
              )}
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined text-lg">bookmark</span>
              </button>
            </div>
          </div>

          {/* Body Content */}

          {liveData ? (
            <div className="relative pl-6 sm:pl-8 border-l border-slate-200 py-2 space-y-8 my-6 w-full max-w-none">
              {liveData.headlines.map((hl, idx) => (
                <div key={idx} className="relative group/timeline-item">
                  
                  {/* Timeline bullet line node */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center bg-white rounded-full p-1 z-10">
                    {idx === 0 ? (
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ba1a1a]"></span>
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full h-3.5 w-3.5 bg-slate-300 group-hover/timeline-item:bg-primary transition-colors"></span>
                    )}
                  </div>

                  {/* Headline content box */}
                  <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    
                    {/* Timestamp & Tag info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                      <span className="font-metadata text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {getTimelineTime(idx, isHindi)}
                      </span>
                      {idx === 0 && (
                        <span className="bg-red-50 text-red-600 border border-red-100 font-label-caps text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse ml-2">
                          {isHindi ? 'नवीनतम अपडेट' : 'LATEST UPDATE'}
                        </span>
                      )}
                    </div>

                    {/* Headline title */}
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold leading-snug text-slate-800 hover:text-primary transition-colors">
                      {hl}
                    </h3>
                    
                    {/* Detail explanation of this live update headline */}
                    <p className="font-body-md text-xs sm:text-sm text-slate-500 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
                      {idx === 0 && displaySummary ? `${displaySummary} ` : ''}
                      {getHeadlineDescription(hl, idx, article.category, isHindi)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <article className="prose prose-lg max-w-none font-body-lg text-body-lg text-on-surface-variant space-y-8 leading-relaxed">
              <p className="first-letter:text-5xl first-letter:font-extrabold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {typeof enrichedParagraphs[0] === 'string' ? enrichedParagraphs[0] : enrichedParagraphs[0].text}
              </p>
              {enrichedParagraphs.slice(1).map((para, idx) => {
                if (para && para.isQuote) {
                  return (
                    <blockquote key={idx} className="border-l-4 border-primary pl-8 my-12 py-4 italic font-headline-md text-headline-md text-on-surface bg-surface-container-low rounded-r-2xl">
                      {para.text}
                    </blockquote>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
            </article>
          )}

          {/* Tags & Interactions */}
          <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-surface-container-low rounded-full font-label-caps text-label-caps text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high cursor-pointer transition-colors">#{article.type.toUpperCase()}</span>
            <span className="px-4 py-2 bg-surface-container-low rounded-full font-label-caps text-label-caps text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high cursor-pointer transition-colors">#{article.category.split('/')[1] || article.category.toUpperCase()}</span>
            <span className="px-4 py-2 bg-surface-container-low rounded-full font-label-caps text-label-caps text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high cursor-pointer transition-colors">#NEWS</span>
          </div>

          {/* Attribution Notice */}
          {article.sourceName && (
            <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-200/50 text-xs text-slate-500 flex items-center justify-between">
              <span className="italic">यह समाचार <strong>हल्द्वानी टाइम्स</strong> द्वारा <strong>{article.sourceName}</strong> से संकलित है। सभी कॉपीराइट संबंधित प्रकाशक के हैं।</span>
              {article.sourceUrl && (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline not-italic shrink-0 ml-4">प्रकाशक देखें &rarr;</a>
              )}
            </div>
          )}

        </div>

        {/* Comment Section */}
        <section className="mt-12 bg-surface-container-lowest rounded-3xl p-8 lg:p-12 editorial-shadow border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8 border-b border-outline-variant/20 pb-4">
            <h3 className="font-headline-lg text-headline-lg text-on-surface font-serif">
              प्रतिक्रियाएँ <span className="text-on-surface-variant font-normal opacity-50 text-headline-md">({comments.length})</span>
            </h3>
          </div>

          <div className="space-y-8">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-slate-500 uppercase select-none shrink-0 ring-1 ring-outline-variant/30">
                  {comment.author.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-on-surface text-sm">{comment.author}</span>
                    <span className="text-metadata text-on-surface-variant opacity-60 text-xs">{comment.time}</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-sm">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button 
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 text-metadata font-metadata text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">thumb_up</span> 
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handlePostComment} className="mt-10 p-4 bg-surface-container-low rounded-2xl flex gap-4 items-center border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold shrink-0 select-none">
              GR
            </div>
            <input 
              type="text" 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="अपना विचार साझा करें..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none placeholder-on-surface-variant/50 p-1"
            />
            <button 
              type="submit" 
              className="material-symbols-outlined text-primary hover:scale-110 transition-transform cursor-pointer"
            >
              send
            </button>
          </form>
        </section>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-serif">आपके लिए चुने गए</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((art) => {
                // Decode HTML entities in title
                const decodeHtml = (str) => {
                  if (!str) return '';
                  return str
                    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
                    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
                    .replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'")
                    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…');
                };
                const displayTitle = decodeHtml(art.title);
                // Fallback image if none available
                const displayImage = art.image_url || art.image || `https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=800&q=80&sig=${art.id}`;
                return (
                <div 
                  key={art.id} 
                  onClick={() => onSelectArticle && onSelectArticle(art)}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow group cursor-pointer border border-outline-variant/10 hover:-translate-y-1 transition-all"
                >
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src={displayImage}
                      alt={displayTitle}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80&sig=${art.id}`;
                      }}
                    />
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[8px] font-bold text-on-surface uppercase select-none shadow-sm">
                      {art.category.split('/')[1] || art.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="font-label-caps text-label-caps text-secondary mb-2 block uppercase text-[10px] tracking-wider font-bold">
                      {art.type}
                    </span>
                    <h4 className="font-headline-md text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug font-serif text-sm md:text-base font-bold">
                      {displayTitle}
                    </h4>
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

export default ArticleDetail;
