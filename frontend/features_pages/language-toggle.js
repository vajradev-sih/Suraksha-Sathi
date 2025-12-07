// Language Toggle Functionality
// This file handles the language switching between English and Hindi

document.addEventListener("DOMContentLoaded", () => {
    const langToggle = document.getElementById("langToggle");
    const knob = document.getElementById("langKnob");
    const langText = document.getElementById("langText");

    const translations = {
        suraksha: {
            en: "Safety",
            hi: "सुरक्षा"
        },
        sathi: {
            en: "Saarthi",
            hi: "सारथी"
        },
        // Menu
        settings: {
            en: "Settings",
            hi: "सेटिंग्स"
        },
        attendance: {
            en: "Attendance",
            hi: "उपस्थिति"
        },
        video_library_menu: {
            en: "Video Library",
            hi: "वीडियो लाइब्रेरी"
        },
        help_support: {
            en: "Help & Support",
            hi: "सहायता और समर्थन"
        },
        language: {
            en: "Language",
            hi: "भाषा"
        },
        sign_out: {
            en: "Sign Out",
            hi: "साइन आउट"
        },

        // Header
        welcome_greeting: {
            en: "Welcome back, John!",
            hi: "वापसी पर स्वागत है, जॉन!"
        },
        welcome_word: {
            en: "Welcome",
            hi: "स्वागत है"
        },
        active_alerts: {
            en: "active",
            hi: "सक्रिय"
        },
        location: {
            en: "Delhi, India",
            hi: "दिल्ली, भारत"
        },
        district: {
            en: "District",
            hi: "जिला"
        },
        state: {
            en: "State",
            hi: "राज्य"
        },
        safety_priority: {
            en: "Your safety and well-being are our top priority.",
            hi: "आपकी सुरक्षा और कल्याण हमारी सर्वोच्च प्राथमिकता है।"
        },
        days: {
            en: "days",
            hi: "दिन"
        },
        injury_free: {
            en: "Injury-Free",
            hi: "चोट-मुक्त"
        },
        incidents: {
            en: "incidents",
            hi: "घटनाएं"
        },
        this_month: {
            en: "This month",
            hi: "इस महीने"
        },
        date_string: {
            en: "Monday, 28 October 2024",
            hi: "सोमवार, 28 अक्टूबर 2024"
        },
        all_clear: {
            en: "All clear",
            hi: "सब साफ़ है"
        },

        // Quick Actions
        emergency: {
            en: "Emergency",
            hi: "आपातकाल"
        },
        report_incident: {
            en: "Report an incident",
            hi: "घटना की रिपोर्ट करें"
        },
        attendance_card: {
            en: "Attendance",
            hi: "उपस्थिति"
        },
        mark_presence: {
            en: "Mark your presence",
            hi: "अपनी उपस्थिति दर्ज करें"
        },

        // Video section
        video_of_day: {
            en: "Video of the Day",
            hi: "दिन का वीडियो"
        },
        video_title: {
            en: "Proper Use of Personal Protective Equipment (PPE)",
            hi: "व्यक्तिगत सुरक्षा उपकरण (पीपीई) का उचित उपयोग"
        },
        video_subtitle: {
            en: "A 2-minute refresher on safety gear essentials.",
            hi: "सुरक्षा गियर की आवश्यकताओं पर 2 मिनट का पुनश्चर्या।"
        },
        video_description: {
            en: "Safety Protocol: Emergency Evacuation",
            hi: "सुरक्षा प्रोटोकॉल: आपातकालीन निकासी"
        },

        // Main button
        complete_checklist: {
            en: "Complete Your Checklist Today",
            hi: "आज ही अपनी चेकलिस्ट पूरी करें"
        },

        // Alerts section
        critical_alerts: {
            en: "Critical Alerts",
            hi: "महत्वपूर्ण अलर्ट"
        },
        active_alerts: {
            en: "2 active",
            hi: "2 सक्रिय"
        },
        alert_gas_leak: {
            en: "Gas Leak Detected in Sector 3",
            hi: "सेक्टर 3 में गैस रिसाव का पता चला"
        },
        high_priority: {
            en: "High priority",
            hi: "उच्च प्राथमिकता"
        },
        five_min_ago: {
            en: "5 min ago",
            hi: "5 मिनट पहले"
        },
        alert_rockfall: {
            en: "Minor Rockfall near Tunnel",
            hi: "सुरंग के पास मामूली चट्टान गिरी"
        },
        medium_priority: {
            en: "Medium priority",
            hi: "मध्यम प्राथमिकता"
        },
        thirty_min_ago: {
            en: "30 min ago",
            hi: "30 मिनट पहले"
        },
        view_all_incidents: {
            en: "View All Incidents",
            hi: "सभी घटनाएं देखें"
        },

        // Map section
        safety_map: {
            en: "Safety Map",
            hi: "सुरक्षा मानचित्र"
        },
        map_alerts: {
            en: "Alerts",
            hi: "अलर्ट"
        },
        map_personnel: {
            en: "Personnel",
            hi: "कर्मी"
        },

        // Recent Activity
        recent_activity: {
            en: "Recent Activity",
            hi: "हाल की गतिविधि"
        },
        activity_gas_leak_title: {
            en: "Gas leak detected in Sector 3",
            hi: "सेक्टर 3 में गैस रिसाव का पता चला"
        },
        activity_gas_leak_time: {
            en: "5 minutes ago",
            hi: "5 मिनट पहले"
        },
        activity_gas_leak_details: {
            en: "Gas concentration reached 200ppm. Evacuated 5 personnel and notified control room. Investigation ongoing.",
            hi: "गैस की सांद्रता 200ppm तक पहुंच गई। 5 कर्मियों को निकाला गया और नियंत्रण कक्ष को सूचित किया गया। जांच जारी है।"
        },
        acknowledge_button: {
            en: "Acknowledge",
            hi: "स्वीकार करें"
        },
        view_button: {
            en: "View",
            hi: "देखें"
        },
        activity_inspection_title: {
            en: "Pre-shift inspection completed",
            hi: "प्री-शिफ्ट निरीक्षण पूरा हुआ"
        },
        activity_inspection_time: {
            en: "15 minutes ago",
            hi: "15 मिनट पहले"
        },
        activity_inspection_details: {
            en: "All checks passed. Minor issues logged for maintenance team.",
            hi: "सभी जांच पास हो गईं। रखरखाव टीम के लिए मामूली मुद्दों को लॉग किया गया।"
        },
        activity_rockfall_title: {
            en: "Minor rockfall reported near Tunnel A",
            hi: "टनल ए के पास मामूली चट्टान गिरने की सूचना है"
        },
        activity_rockfall_time: {
            en: "30 minutes ago",
            hi: "30 मिनट पहले"
        },
        activity_rockfall_details: {
            en: "Small debris observed, area cordoned off for inspection. No injuries.",
            hi: "छोटा मलबा देखा गया, निरीक्षण के लिए क्षेत्र को बंद कर दिया गया। कोई चोट नहीं।"
        },

        // Progress Section
        your_progress: {
            en: "Your Progress",
            hi: "आपकी प्रगति"
        },
        safety_training: {
            en: "Safety Training",
            hi: "सुरक्षा प्रशिक्षण"
        },
        knowledge_base: {
            en: "Knowledge Base",
            hi: "ज्ञानकोष"
        },

        // Badges Section
        your_badges: {
            en: "Your Badges",
            hi: "आपके बैज"
        },
        badge_safety_master: {
            en: "Safety Master",
            hi: "सुरक्षा मास्टर"
        },
        badge_first_responder: {
            en: "First Responder",
            hi: "प्राथमिक प्रतिक्रियाकर्ता"
        },
        badge_quiz_whiz: {
            en: "Quiz Whiz",
            hi: "क्विज़ विशेषज्ञ"
        },
        badge_video_learner: {
            en: "Video Learner",
            hi: "वीडियो लर्नर"
        },
        badge_alert_hero: {
            en: "Alert Hero",
            hi: "अलर्ट हीरो"
        },

        // Bottom Nav
        nav_home: {
            en: "Home",
            hi: "होम"
        },
        nav_library: {
            en: "Library",
            hi: "लाइब्रेरी"
        },
        nav_checklists: {
            en: "Checklists",
            hi: "चेकलिस्ट"
        },
        nav_videos: {
            en: "Shorts",
            hi: "शॉर्ट्स"
        },

        // --- Attendance Page ---
        attendance_page_title: { en: "Attendance", hi: "उपस्थिति" },
        mark_today_attendance: { en: "Mark Today's Attendance", hi: "आज की उपस्थिति दर्ज करें" },
        mark_attendance_subtext: { en: "Tap the button below to mark your presence. Your current location will be recorded for verification.", hi: "अपनी उपस्थिति दर्ज करने के लिए नीचे दिए गए बटन पर टैप करें। सत्यापन के लिए आपका वर्तमान स्थान रिकॉर्ड किया जाएगा।" },
        mark_presence_button: { en: "Mark Presence", hi: "उपस्थिति दर्ज करें" },
        fetching_location: { en: "Fetching your location...", hi: "आपका स्थान प्राप्त किया जा रहा है..." },
        todays_status: { en: "Today's Status", hi: "आज की स्थिति" },
        you_are_marked: { en: "You are marked ", hi: "आप चिह्नित हैं " },
        present_caps: { en: "PRESENT", hi: "उपस्थित" },
        checked_in_at: { en: "Checked-in at:", hi: "चेक-इन समय:" },
        location_label: { en: "Location:", hi: "स्थान:" },
        monthly_summary: { en: "Monthly Summary", hi: "मासिक सारांश" },
        present_label: { en: "Present", hi: "उपस्थित" },
        absent_label: { en: "Absent", hi: "अनुपस्थित" },
        leaves_label: { en: "Leaves", hi: "छुट्टियां" },
        month_label: { en: "Month", hi: "महीना" },
        presence_marked_success: { en: "Presence Marked", hi: "उपस्थिति दर्ज की गई" },
        attendance_recorded_msg: { en: "Your attendance for today has been recorded.", hi: "आज के लिए आपकी उपस्थिति दर्ज कर ली गई है।" },

        // --- Checklist Page ---
        checklist_page_title: { en: "Pre-Shift Vehicle Inspection", hi: "प्री-शिफ्ट वाहन निरीक्षण" },
        daily_completion: { en: "Daily Completion", hi: "दैनिक समापन" },
        compliance_streak: { en: "Your compliance streak this week.", hi: "इस सप्ताह आपकी अनुपालन श्रृंखला।" },
        overall_progress: { en: "Overall Progress", hi: "कुल प्रगति" },
        percent_completed: { en: "{percent}% completed", hi: "{percent}% पूरा हुआ" },
        days_completed: { en: "{checked}/{total} Days", hi: "{checked}/{total} दिन" },
        add_note_btn: { en: "Add Note", hi: "नोट जोड़ें" },
        submit_report_btn: { en: "Submit Report", hi: "रिपोर्ट सबमिट करें" },
        past_inspections: { en: "Past Inspections", hi: "पिछले निरीक्षण" },
        cancel_btn: { en: "Cancel", hi: "रद्द करें" },
        save_btn: { en: "Save", hi: "सहेजें" },
        loading_checklist: { en: "Loading checklist...", hi: "चेकलिस्ट लोड हो रही है..." },

        // --- Report Page ---
        report_hazard_title: { en: "Report a Hazard", hi: "खतरे की रिपोर्ट करें" },
        describe_hazard_label: { en: "Describe the Hazard", hi: "खतरे का वर्णन करें" },
        severity_level_label: { en: "Severity Level", hi: "गंभीरता स्तर" },
        severity_low: { en: "Low", hi: "कम" },
        severity_medium: { en: "Medium", hi: "मध्यम" },
        severity_high: { en: "High", hi: "उच्च" },
        severity_critical: { en: "Critical", hi: "गंभीर" },
        next_button: { en: "Next", hi: "अगला" },
        back_button: { en: "Back", hi: "वापस" },
        submit_button: { en: "Submit", hi: "जमा करें" },
        location_step_title: { en: "Location", hi: "स्थान" },
        upload_photo_title: { en: "Upload Photo", hi: "फोटो अपलोड करें" },
        add_photos_label: { en: "Add Photo(s)", hi: "फोटो जोड़ें" },
        upload_button: { en: "Upload", hi: "अपलोड" },
        take_photo_btn: { en: "Take Photo", hi: "फोटो लें" },
        choose_gallery_btn: { en: "Choose from Gallery", hi: "गैलरी से चुनें" },
        review_step_title: { en: "Review", hi: "समीक्षा" },
        preview_report_title: { en: "Preview Report", hi: "रिपोर्ट पूर्वावलोकन" },
        preview_desc: { en: "Description:", hi: "विवरण:" },
        preview_severity: { en: "Severity:", hi: "गंभीरता:" },
        preview_location: { en: "Location:", hi: "स्थान:" },
        preview_photos: { en: "Photos:", hi: "तस्वीरें:" },
        save_draft_button: { en: "Save Draft", hi: "ड्राफ्ट सहेजें" },

        // Video Library
        safety_resources_title: { en: "Safety Resources", hi: "सुरक्षा संसाधन" },
        search_placeholder: { en: "Search for resources...", hi: "संसाधन खोजें..." },
        tab_all: { en: "All", hi: "सभी" },
        tab_videos: { en: "Videos", hi: "वीडियो" },
        tab_case_studies: { en: "Case Studies", hi: "केस स्टडीज" },
        label_video: { en: "Video", hi: "वीडियो" },
        label_new: { en: "NEW", hi: "नया" },
        label_case_study: { en: "CASE STUDY", hi: "केस स्टडी" },
        popup_overview: { en: "Overview:", hi: "अवलोकन:" },
        popup_root_cause: { en: "Root Cause:", hi: "मूल कारण:" },
        popup_dgms_ref: { en: "DGMS Reference:", hi: "DGMS संदर्भ:" },
        popup_safety_measures: { en: "DGMS Safety Measures", hi: "DGMS सुरक्षा उपाय" },
        popup_view_circulars: { en: "View DGMS Safety Circulars", hi: "DGMS सुरक्षा परिपत्र देखें" }
    };

    // Load saved language (default English)
    let currentLang = localStorage.getItem("lang") || "en";

    // Apply initial state
    applyLanguage(currentLang);

    // Handle toggle click
    const langToggleWrapper = document.getElementById("langToggleWrapper");
    if (langToggleWrapper) {
        // Ensure cursor pointer
        langToggleWrapper.style.cursor = "pointer";
        
        // Use onclick to ensure single handler and avoid propagation issues
        langToggleWrapper.onclick = (e) => {
            // Prevent default behavior if it's a label/input interaction
            e.preventDefault();
            
            // Flip language
            currentLang = currentLang === "en" ? "hi" : "en";
            localStorage.setItem("lang", currentLang);
            applyLanguage(currentLang);
        };
    }

    function applyLanguage(lang) {
        // Update toggle switch UI
        if (knob && langText) {
            if (lang === "hi") {
                knob.style.transform = "translateX(24px)";
                langText.textContent = "HI";
                document.documentElement.lang = 'hi';
            } else {
                knob.style.transform = "translateX(0)";
                langText.textContent = "EN";
                document.documentElement.lang = 'en';
            }
        }

        // Update all elements with data-translate-key attribute
        document.querySelectorAll("[data-translate-key]").forEach(element => {
            const key = element.getAttribute("data-translate-key");
            if (translations[key] && translations[key][lang]) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translations[key][lang];
                } else {
                    element.textContent = translations[key][lang];
                }
            }
        });

        // Special case for buttons that appear multiple times
        document.querySelectorAll('.ack-btn').forEach(btn => {
            if (translations['acknowledge_button'] && translations['acknowledge_button'][lang]) {
                btn.textContent = translations['acknowledge_button'][lang];
            }
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            if (translations['view_button'] && translations['view_button'][lang]) {
                btn.textContent = translations['view_button'][lang];
            }
        });
        
        // Expose translations to global scope for other scripts to use
        window.translations = translations;
    }

    // Expose function globally for dynamic content
    window.applyLanguageTranslation = applyLanguage;
    window.getCurrentLanguage = () => currentLang;
});
