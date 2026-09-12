(function(){
  const CLOUDINARY_CLOUD_NAME = 'dnvul9kes';
  const CLOUDINARY_UPLOAD_PRESET = 'millenium';
  const EMAILJS_PUBLIC_KEY = '4iGVlNFEdP_AymO2p';
  const EMAILJS_SERVICE_ID = 'service_cwur66d';
  const EMAILJS_TEMPLATE_ID = 'template_w9xsrks';
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzebqqol';

  const form = document.getElementById('inscriptionForm');
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  const successView = document.getElementById('successView');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('proofFile');
  const preview = document.getElementById('filePreview');
  const previewThumb = document.getElementById('previewThumb');
  const previewName = document.getElementById('previewName');
  const previewSize = document.getElementById('previewSize');
  const removeFileBtn = document.getElementById('removeFile');
  const submitBtn = form.querySelector('.submit-btn');
  const copyPhoneBtns = document.querySelectorAll('.copy-phone');
  const whatsappInput = document.getElementById('whatsapp');
  const phoneInput = window.intlTelInput(whatsappInput, {
    initialCountry: 'bj',
    preferredCountries: ['bj', 'ci', 'tg', 'ng', 'fr'],
    separateDialCode: true,
    nationalMode: true,
    autoPlaceholder: 'aggressive',
    strictMode: true,
    loadUtils: () => import('https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js')
  });

  function updatePhonePlaceholder(){
    try {
      const country = phoneInput.getSelectedCountryData();
      if(window.intlTelInputUtils && country && country.iso2){
        const ph = intlTelInputUtils.getExampleNumber(
          country.iso2, true, intlTelInputUtils.numberType.MOBILE
        );
        whatsappInput.placeholder = ph || '01 XX XX XX XX';
      } else if(typeof phoneInput.getPlaceholder === 'function'){
        whatsappInput.placeholder = phoneInput.getPlaceholder() || '01 XX XX XX XX';
      } else {
        whatsappInput.placeholder = '01 XX XX XX XX';
      }
    } catch(err){
      whatsappInput.placeholder = '01 XX XX XX XX';
    }
  }

  whatsappInput.addEventListener('countrychange', updatePhonePlaceholder);
  phoneInput.promise.then(updatePhonePlaceholder);
  const startRegistrationBtn = document.getElementById('startRegistration');
  const backToOverviewBtn = document.getElementById('backToOverview');
  const paymentConfirmedInput = document.getElementById('paymentConfirmed');
  const paymentContinueBtn = document.getElementById('paymentContinue');
  const stepCaption = document.getElementById('stepCaption');
  const clubField = document.getElementById('clubField');
  const clubNameInput = document.getElementById('clubName');
  const clubMemberRadios = document.querySelectorAll('input[name="clubMember"]');

  function updateClubField(){
    const selected = document.querySelector('input[name="clubMember"]:checked');
    const isYes = selected && selected.value === 'oui';
    clubField.hidden = !isYes;
    clubNameInput.required = isYes;
    if(!isYes){
      clubNameInput.value = '';
      clearError('clubName');
    }
  }

  clubMemberRadios.forEach(r => r.addEventListener('change', updateClubField));
  updateClubField();

  const stepCaptions = {
    1: 'Vos informations personnelles',
    2: 'Votre motivation et les modalités de paiement',
    3: 'Ajoutez votre preuve puis envoyez'
  };
  const stepCaptionsEn = {
    1: 'Your personal details',
    2: 'Your motivation and payment details',
    3: 'Add your proof and submit'
  };
  let currentStep = 1;
  const MAX_SIZE = 5 * 1024 * 1024;
  let selectedFile = null;
  let uploadedUrl = null;
  let uploading = false;

  const translations = {
    fr: {
      pageTitle: 'Nautile Academy 1 | Création de contenu — Cotonou', pageDescription: 'Inscription à La Nautile Academy 1 : Création de contenu (Photo, Cadrage & Montage) — le 14 Novembre 2026 à Fidrosse, Escale des Pêcheurs, Cotonou.', tagline: 'Nautile Academy 1', heroTitle: 'Création de <span>contenu</span>',
      introOne: 'Nautile Academy est le programme de formation du Club Rotaract Satellite de Cotonou « Le Nautile Connect ». Il accompagne les jeunes de Cotonou dans l\'acquisition de compétences concrètes, portées par l\'esprit de service et de connexion qui anime le club.',
      introTwo: 'Ce premier atelier porte sur la <strong>création de contenu</strong> : Photo, Cadrage & Montage. Les places sont limitées : l\'inscription se fait en remplissant la fiche ci-contre et en réglant les frais de participation.',
      howTitle: 'Comment ça se passe', howRegistration: '<b>Inscription</b> — vous complétez la fiche avec vos coordonnées et votre motivation.',
      howPayment: '<b>Paiement</b> — vous réglez les frais de participation au contact indiqué ci-dessous.', howProof: '<b>Preuve</b> — vous joignez une capture ou une photo du reçu de paiement au formulaire.', howConfirmation: '<b>Confirmation</b> — votre place est validée dès réception de votre fiche complète.',
      feeLabel: 'Frais de participation', payTo: 'À verser au', amountLabel: 'Montant à régler', recipientLabel: 'Nom du destinataire', register: 'M\'inscrire', feedbackLink: 'Une suggestion ou un problème ? Écrivez-nous', formTitle: 'Fiche d\'inscription', stepOneCaption: 'Vos informations personnelles', backOverview: '← Retour à la présentation', back: 'Retour', continue: 'Continuer', selectProfile: 'Sélectionnez votre profil', student: 'Élève', universityStudent: 'Étudiant(e)', professional: 'Professionnel(le) en activité', entrepreneur: 'Entrepreneur(se)', rotaryMember: 'Membre Rotaract / Rotary', other: 'Autre', proofLabel: 'Preuve de paiement <span class="req">*</span>', uploadMain: 'Cliquez ou déposez votre reçu ici', uploadSub: 'Image (JPG, PNG) ou PDF — 5 Mo maximum', removeFile: 'Retirer', proofHint: 'Joignez la capture ou la photo du reçu de votre virement au 01 62 61 76 27. Ce champ est requis pour valider votre inscription.', formNote: 'Vos données sont transmises de façon sécurisée à l\'organisation.', successTitle: 'Fiche prête à être envoyée', successText: 'Votre inscription est complète. Transmettez-la au Nautile Academy par WhatsApp en joignant votre preuve de paiement.', sendWhatsApp: 'Envoyer via WhatsApp', newForm: 'Remplir une nouvelle fiche', meetingLabel: 'Le rendez-vous', locationTitle: 'Retrouvez-nous facilement', openMaps: 'Ouvrir dans Google Maps ↗', supportLabel: 'Avec le soutien de', partnersTitle: 'Nos partenaires', socialLabel: 'La communauté continue en ligne', socialTitle: 'Suivez-nous', paymentLabel: 'Paiement', contactLabel: 'Contact', copyright: '© 2026 Club Rotaract Satellite de Cotonou — Le Nautile Connect. Tous droits réservés.', developer: 'Site développé par <a class="developer-link" href="https://mideessi.com" target="_blank" rel="noopener">MIDEESSI TECH SARL</a>.',
      fullnameLabel: 'Noms et prénoms <span class="req">*</span>', classificationLabel: 'Classification <span class="req">*</span>', clubMemberLabel: 'Faites-vous partie d\'un club ?', clubLabel: 'Nom du club <span class="req">*</span>', yes: 'Oui', no: 'Non', emailLabel: 'Adresse e-mail <span class="req">*</span>', whatsappLabel: 'Numéro WhatsApp <span class="req">*</span>', motivationLabel: 'Motivations pour la formation <span class="req">*</span>', paymentConsent: 'J\'ai pris connaissance des modalités de paiement.', submit: 'Envoyer mon inscription', stepOne: 'Coordonnées', stepTwo: 'Motivation & paiement', stepThree: 'Preuve'
    },
    en: {
      pageTitle: 'Nautile Academy 1 | Content Creation — Cotonou', pageDescription: 'Register for Nautile Academy 1: Content Creation (Photo, Framing & Editing) — November 7, 2026 at Fidrosse, Escale des Pêcheurs, Cotonou.', tagline: 'Nautile Academy 1', heroTitle: 'Content <span>Creation</span>',
      introOne: 'Nautile Academy is the training program of the Rotaract Club of Cotonou Satellite — Le Nautile Connect. It helps young people in Cotonou build practical skills through service and connection.',
      introTwo: 'This first workshop focuses on <strong>content creation</strong>: Photo, Framing & Editing. Places are limited: register by completing the form and paying the participation fee.',
      howTitle: 'How it works', howRegistration: '<b>Registration</b> — complete the form with your details and motivation.',
      howPayment: '<b>Payment</b> — pay the participation fee using the contact below.', howProof: '<b>Proof</b> — attach a screenshot or photo of your payment receipt.', howConfirmation: '<b>Confirmation</b> — your place is confirmed once your complete form is received.',
      feeLabel: 'Participation fee', payTo: 'Pay to', amountLabel: 'Amount to pay', recipientLabel: 'Recipient name', register: 'Register', feedbackLink: 'Have a suggestion or a problem? Contact us', formTitle: 'Registration form', stepOneCaption: 'Your personal details', backOverview: '← Back to overview', back: 'Back', continue: 'Continue', selectProfile: 'Select your profile', student: 'Student', universityStudent: 'University student', professional: 'Working professional', entrepreneur: 'Entrepreneur', rotaryMember: 'Rotaract / Rotary member', other: 'Other', proofLabel: 'Payment proof <span class="req">*</span>', uploadMain: 'Click or drop your receipt here', uploadSub: 'Image (JPG, PNG) or PDF — 5 MB maximum', removeFile: 'Remove', proofHint: 'Attach a screenshot or photo of your payment receipt (transfer to 01 62 61 76 27). This field is required to confirm your registration.', formNote: 'Your data is securely transmitted to the organization.', successTitle: 'Form ready to send', successText: 'Your registration is complete. Send it to Nautile Academy via WhatsApp with your payment proof.', sendWhatsApp: 'Send via WhatsApp', newForm: 'Fill out a new form', meetingLabel: 'The venue', locationTitle: 'Find us easily', openMaps: 'Open in Google Maps ↗', supportLabel: 'With the support of', partnersTitle: 'Our partners', socialLabel: 'The community continues online', socialTitle: 'Follow us', paymentLabel: 'Payment', contactLabel: 'Contact', copyright: '© 2026 Rotaract Club of Cotonou Satellite — Le Nautile Connect. All rights reserved.', developer: 'Website developed by <a class="developer-link" href="https://mideessi.com" target="_blank" rel="noopener">MIDEESSI TECH SARL</a>.',
      fullnameLabel: 'Full name <span class="req">*</span>', classificationLabel: 'Profile <span class="req">*</span>', clubMemberLabel: 'Are you a member of a club?', clubLabel: 'Club name <span class="req">*</span>', yes: 'Yes', no: 'No', emailLabel: 'Email address <span class="req">*</span>', whatsappLabel: 'WhatsApp number <span class="req">*</span>', motivationLabel: 'Motivation for the workshop <span class="req">*</span>', paymentConsent: 'I have read and understood the payment details.', submit: 'Submit my registration', stepOne: 'Details', stepTwo: 'Motivation & payment', stepThree: 'Proof'
    }
  };

  function applyLanguage(language){
    const dictionary = translations[language] || translations.fr;
    document.documentElement.lang = language;
    document.title = dictionary.pageTitle;
    document.querySelector('meta[name="description"]').setAttribute('content', dictionary.pageDescription);
    document.querySelector('meta[property="og:title"]').setAttribute('content', dictionary.pageTitle);
    document.querySelector('meta[property="og:description"]').setAttribute('content', dictionary.pageDescription);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', dictionary.pageTitle);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', dictionary.pageDescription);
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = dictionary[element.dataset.i18n];
      if(value) element.innerHTML = value;
    });
    const footerDescription = document.querySelector('[data-i18n="footerDescription"]');
    if(footerDescription){
      footerDescription.textContent = language === 'en'
        ? 'Nautile Academy, the training program of the Rotaract Club of Cotonou Satellite — Le Nautile Connect.'
        : 'Nautile Academy, le programme de formation du Club Rotaract Satellite de Cotonou — Le Nautile Connect.';
    }
    const mainPaymentLabel = document.querySelector('.pay-card .row > span:first-child');
    if(mainPaymentLabel) mainPaymentLabel.textContent = dictionary.payTo;
    const stepPaymentLines = document.querySelectorAll('.step-payment-card > span');
    if(stepPaymentLines[1] && stepPaymentLines[1].firstChild) stepPaymentLines[1].firstChild.nodeValue = dictionary.payTo + ' ';
    if(stepPaymentLines[2] && stepPaymentLines[2].firstChild) stepPaymentLines[2].firstChild.nodeValue = dictionary.recipientLabel + ' : ';
    const placeholders = language === 'en' ? {
      fullname: 'e.g. BOGNON Dona Gracias Yeratel',
      classification: 'e.g. Web developer, Lawyer, Doctor, Student…',
      clubName: 'e.g. Rotaract Club of Cotonou',
      email: 'you@example.com',
      motivation: 'Why would you like to attend this workshop?'
    } : {
      fullname: 'Ex : BOGNON Dona Gracias Yeratel',
      classification: 'Ex : Développeur web, Juriste, Médecin, Étudiant(e)…',
      clubName: 'Ex : Rotaract Club de Cotonou',
      email: 'vous@exemple.com',
      motivation: 'Pourquoi souhaitez-vous participer à cet atelier ?'
    };
    Object.entries(placeholders).forEach(([name, placeholder]) => {
      if(form.elements[name]) form.elements[name].placeholder = placeholder;
    });
    document.querySelectorAll('.language-btn').forEach(button => button.classList.toggle('active', button.dataset.language === language));
    if(stepCaption){
      stepCaption.textContent = (language === 'en' ? stepCaptionsEn : stepCaptions)[currentStep];
    }
    localStorage.setItem('nautile-language', language);
  }

  const errorMessages = {
    fr: {
      fullname: 'Merci d\'indiquer vos noms et prénoms.', classification: 'Merci d\'indiquer votre classification.', clubMember: 'Merci d\'indiquer si vous faites partie d\'un club.', email: 'Adresse e-mail invalide.', whatsapp: 'Numéro WhatsApp invalide.', motivation: 'Merci d\'indiquer votre motivation.', clubName: 'Merci d\'indiquer le nom de votre club.'
    },
    en: {
      fullname: 'Please enter your full name.', classification: 'Please enter your profile.', clubMember: 'Please indicate whether you belong to a club.', email: 'Invalid email address.', whatsapp: 'Invalid WhatsApp number.', motivation: 'Please enter your motivation.', clubName: 'Please enter your club name.'
    }
  };

  document.querySelectorAll('.language-btn').forEach(button => {
    button.addEventListener('click', () => applyLanguage(button.dataset.language));
  });
  applyLanguage(localStorage.getItem('nautile-language') || 'fr');



  function showCopied(copyPhoneBtn){
    const originalContent = copyPhoneBtn.innerHTML;
    copyPhoneBtn.innerHTML = '<span>Copié ✓</span>';
    copyPhoneBtn.classList.add('copied');
    window.setTimeout(() => {
      copyPhoneBtn.innerHTML = originalContent;
      copyPhoneBtn.classList.remove('copied');
    }, 1600);
  }

  copyPhoneBtns.forEach(copyPhoneBtn => copyPhoneBtn.addEventListener('click', async () => {
    const number = copyPhoneBtn.dataset.copy;
    try {
      await navigator.clipboard.writeText(number);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = number;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    showCopied(copyPhoneBtn);
  }));

  function fmtSize(bytes){
    if(bytes < 1024) return bytes + ' o';
    if(bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' Ko';
    return (bytes/(1024*1024)).toFixed(1) + ' Mo';
  }

  function languageText(fr, en){
    return (localStorage.getItem('nautile-language') || 'fr') === 'en' ? en : fr;
  }

  function showFile(file){
    selectedFile = file;
    uploadedUrl = null;
    previewName.textContent = file.name;
    previewSize.textContent = languageText('Envoi en cours…', 'Uploading…');
    if(file.type.startsWith('image/')){
      const reader = new FileReader();
      reader.onload = e => {
        const el = document.getElementById('previewThumb');
        el.outerHTML = '<img id="previewThumb" src="'+e.target.result+'" alt="">';
      };
      reader.readAsDataURL(file);
    } else {
      const existingImg = document.getElementById('previewThumb');
      if(existingImg && existingImg.tagName === 'IMG'){
        existingImg.outerHTML = '<div class="filedoc" id="previewThumb">PDF</div>';
      }
    }
    preview.classList.add('show');
    dropZone.style.display = 'none';
    clearError('proofFile');
    uploadToCloudinary(file);
  }

  function uploadToCloudinary(file){
    uploading = true;
    submitBtn.disabled = true;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('folder', 'nautile-academy/preuves-paiement');

    fetch('https://api.cloudinary.com/v1_1/' + CLOUDINARY_CLOUD_NAME + '/auto/upload', {
      method: 'POST',
      body: fd
    })
    .then(r => r.json())
    .then(data => {
      uploading = false;
      submitBtn.disabled = false;
      if(data.secure_url){
        uploadedUrl = data.secure_url;
        previewSize.textContent = fmtSize(file.size) + (localStorage.getItem('nautile-language') === 'en' ? ' — uploaded' : ' — envoyé');
        clearError('proofFile');
      } else {
        previewSize.textContent = fmtSize(file.size);
        const reason = data.error && data.error.message ? ' (' + data.error.message + ')' : '';
        setError('proofFile', languageText('Échec de l\'envoi vers Cloudinary', 'Cloudinary upload failed') + reason + '.');
      }
    })
    .catch(() => {
      uploading = false;
      submitBtn.disabled = false;
      previewSize.textContent = fmtSize(file.size);
      setError('proofFile', languageText('Échec de l\'envoi vers Cloudinary. Vérifiez la connexion.', 'Cloudinary upload failed. Check your connection.'));
    });
  }

  function clearFile(){
    selectedFile = null;
    uploadedUrl = null;
    fileInput.value = '';
    preview.classList.remove('show');
    dropZone.style.display = 'block';
  }

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if(fileInput.files[0]) validateAndSetFile(fileInput.files[0]);
  });

  ['dragenter','dragover'].forEach(evt => {
    dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('drag'); });
  });
  ['dragleave','drop'].forEach(evt => {
    dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('drag'); });
  });
  dropZone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if(file) validateAndSetFile(file);
  });

  removeFileBtn.addEventListener('click', clearFile);

  function validateAndSetFile(file){
    const okType = file.type.startsWith('image/') || file.type === 'application/pdf';
    if(!okType){
      setError('proofFile', languageText('Formats acceptés : image ou PDF.', 'Accepted formats: image or PDF.'));
      return;
    }
    if(file.size > MAX_SIZE){
      setError('proofFile', languageText('Le fichier dépasse 5 Mo.', 'The file exceeds 5 MB.'));
      return;
    }
    showFile(file);
  }

  function setError(field, msg){
    const el = document.querySelector('[data-error-for="'+field+'"]');
    if(el) el.textContent = msg;
  }
  function clearError(field){ setError(field, ''); }

  function goToStep(step){
    currentStep = step;
    document.querySelectorAll('.form-step').forEach(panel => {
      panel.classList.toggle('active', Number(panel.dataset.step) === step);
    });
    document.querySelectorAll('[data-step-indicator]').forEach(indicator => {
      const number = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle('active', number === step);
      indicator.classList.toggle('done', number < step);
    });
    const currentLanguage = localStorage.getItem('nautile-language') || 'fr';
    stepCaption.textContent = (currentLanguage === 'en' ? stepCaptionsEn : stepCaptions)[step];
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(step){
    if(step === 1){
      let valid = true;
      ['fullname','classification','email','whatsapp'].forEach(name => {
        if(!validateField(form.elements[name])) valid = false;
      });
      // Validate clubMember radio
      const clubMemberSelected = document.querySelector('input[name="clubMember"]:checked');
      if(!clubMemberSelected){
        setError('clubMember', (errorMessages[localStorage.getItem('nautile-language') || 'fr'] || errorMessages.fr).clubMember);
        valid = false;
      } else {
        clearError('clubMember');
        if(clubMemberSelected.value === 'oui' && !validateField(clubNameInput)) valid = false;
      }
      return valid;
    }
    if(step === 2){
      const motivationValid = validateField(form.elements.motivation);
      if(!motivationValid) return false;
      if(window.matchMedia('(min-width: 881px)').matches) return true;
      const paymentConfirmed = form.elements.paymentConfirmed;
      if(!paymentConfirmed.checked){
        setError('paymentConfirmed', 'Confirmez les modalités de paiement pour continuer.');
        return false;
      }
      clearError('paymentConfirmed');
    }
    return true;
  }

  document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', () => {
      const nextStep = Number(button.dataset.next);
      if(validateStep(currentStep)) goToStep(nextStep);
    });
  });

  paymentConfirmedInput.addEventListener('change', () => {
    paymentContinueBtn.disabled = !paymentConfirmedInput.checked;
    if(paymentConfirmedInput.checked) clearError('paymentConfirmed');
  });

  document.querySelectorAll('.back-step').forEach(button => {
    button.addEventListener('click', () => goToStep(Number(button.dataset.back)));
  });

  startRegistrationBtn.addEventListener('click', () => {
    document.body.classList.add('registration-open');
    goToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  backToOverviewBtn.addEventListener('click', () => {
    document.body.classList.remove('registration-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function validateField(input){
    input.setAttribute('data-touched', 'true');
    if(input.name === 'whatsapp'){
      const validPhone = phoneInput.isValidNumber();
      setError('whatsapp', validPhone ? '' : 'Numéro WhatsApp invalide.');
      return validPhone;
    }
    if(!input.value || (input.type === 'email' && !input.checkValidity())){
      const msgs = {
        fullname: 'Merci d\'indiquer vos noms et prénoms.',
        classification: 'Merci de choisir une classification.',
        email: 'Adresse e-mail invalide.',
        whatsapp: 'Merci d\'indiquer un numéro WhatsApp.',
        motivation: 'Merci d\'indiquer votre motivation.',
        clubName: 'Merci d\'indiquer le nom de votre club.',
        otherProfile: 'Merci de préciser votre profil.'
      };
      const language = localStorage.getItem('nautile-language') || 'fr';
      setError(input.name, errorMessages[language][input.name] || (language === 'en' ? 'Required field.' : 'Champ requis.'));
      return false;
    }
    clearError(input.name);
    return true;
  }

  ['fullname','classification','email','whatsapp','motivation','clubName'].forEach(name => {
    const el = form.elements[name];
    if(!el) return;
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => { if(el.getAttribute('data-touched')) validateField(el); });
  });

  // ── Formspree : notification e-mail au club ────────────────────────────────
  function sendToFormspree(data, proofUrl) {
    const body = new URLSearchParams({
      'Nom et prénoms'    : data.fullname,
      'Classification'    : data.classification,
      'Membre d\'un club' : data.clubMember,
      'Nom du club'       : data.clubMember === 'Oui' ? data.clubName : '—',
      'E-mail'            : data.email,
      'WhatsApp'          : data.whatsapp,
      'Motivation'        : data.motivation,
      'Preuve de paiement': proofUrl || 'Non jointe',
      '_subject'          : 'Nouvelle inscription — Nautile Academy 1'
    });
    fetch(FORMSPREE_ENDPOINT, {
      method : 'POST',
      headers: { 'Accept': 'application/json' },
      body   : body
    }).catch(() => { /* silencieux — EmailJS reste le canal principal */ });
  }
  // ──────────────────────────────────────────────────────────────────────────

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(uploading){
      setError('proofFile', languageText('Envoi de la preuve en cours, patientez…', 'The proof is uploading, please wait…'));
      return;
    }
    let valid = true;
    ['fullname','classification','email','whatsapp','motivation'].forEach(name => {
      if(!validateField(form.elements[name])) valid = false;
    });
    const clubMemberChecked = document.querySelector('input[name="clubMember"]:checked');
    if(clubMemberChecked && clubMemberChecked.value === 'oui' && !validateField(clubNameInput)) valid = false;
    if(!valid) return;
    if(!validateStep(2)){
      goToStep(2);
      return;
    }

    // Preuve de paiement obligatoire
    if(!selectedFile){
      setError('proofFile', languageText(
        'La preuve de paiement est requise. Joignez la capture de votre reçu.',
        'Payment proof is required. Please attach a screenshot of your receipt.'
      ));
      goToStep(3);
      return;
    }
    if(!uploadedUrl){
      setError('proofFile', languageText(
        'La preuve de paiement n\'a pas encore été envoyée. Patientez ou réessayez.',
        'Payment proof has not been uploaded yet. Please wait or try again.'
      ));
      goToStep(3);
      return;
    }

    const isEnglish = (localStorage.getItem('nautile-language') || 'fr') === 'en';
    const confirmation = await Swal.fire({
      title: isEnglish ? 'Confirm submission?' : 'Confirmer l\'envoi ?',
      text: isEnglish ? 'Your registration will be sent to Nautile Academy.' : 'Votre inscription sera transmise à Nautile Academy.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isEnglish ? 'Yes, submit' : 'Oui, envoyer',
      cancelButtonText: isEnglish ? 'Review again' : 'Vérifier encore',
      confirmButtonColor: '#0B3D91',
      cancelButtonColor: '#6B7890',
      reverseButtons: true
    });
    if(!confirmation.isConfirmed) return;

    const clubMemberSelected = document.querySelector('input[name="clubMember"]:checked');
    const data = {
      fullname: form.fullname.value.trim(),
      classification: form.classification.value.trim(),
      clubMember: clubMemberSelected ? (clubMemberSelected.value === 'oui' ? 'Oui' : 'Non') : 'Non',
      clubName: clubNameInput.value.trim(),
      email: form.email.value.trim(),
      whatsapp: phoneInput.getNumber(),
      motivation: form.motivation.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = languageText('Envoi en cours…', 'Submitting…');

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      fullname: data.fullname,
      classification: data.classification,
      club_member: data.clubMember,
      club_name: data.clubMember === 'Oui' ? data.clubName : '—',
      email: data.email,
      whatsapp: data.whatsapp,
      motivation: data.motivation,
      payment_confirmed: form.paymentConfirmed.checked ? 'Oui' : 'Non',
      payment_proof: uploadedUrl || 'Non jointe',
      event_name: 'La Nautile Academy 1 — Création de contenu',
      event_date: '14 Novembre 2026 à 09h00',
      event_location: 'Fidrosse, Escale des Pêcheurs, Cotonou',
      subject: 'Nouvelle inscription — Nautile Academy 1 : Création de contenu',
      reply_to: data.email
    })
    .then(() => {
      sendToFormspree(data, uploadedUrl);
      submitBtn.disabled = false;
      submitBtn.textContent = languageText('Envoyer mon inscription', 'Submit my registration');
      showSuccess(data);
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = languageText('Envoyer mon inscription', 'Submit my registration');
      setError('motivation', '');
      alert(languageText('L\'envoi a échoué. Vérifiez votre connexion et réessayez, ou contactez-nous directement via WhatsApp.', 'Submission failed. Check your connection and try again, or contact us directly on WhatsApp.'));
    });
  });

  function showSuccess(data){
    const recapBox = document.getElementById('recapBox');
    const recapRows = [
      ['Nom et prénoms', data.fullname],
      ['Classification', data.classification],
      ['Club', data.clubName || 'Non concerné'],
      ['E-mail', data.email],
      ['WhatsApp', data.whatsapp],
      ['Preuve jointe', uploadedUrl ? 'Envoyée ✓' : 'Non jointe']
    ];
    recapBox.innerHTML = recapRows.map(([k,v]) => '<div><span>'+k+'</span><span>'+v+'</span></div>').join('');

    const waText = encodeURIComponent(
      'Inscription Nautile Academy — Premier atelier\n' +
      'Nom et prénoms : ' + data.fullname + '\n' +
      'Classification : ' + data.classification + '\n' +
      'Club : ' + (data.clubName || 'Non concerné') + '\n' +
      'E-mail : ' + data.email + '\n' +
      'WhatsApp : ' + data.whatsapp + '\n' +
      'Motivation : ' + data.motivation + '\n' +
      (uploadedUrl ? 'Preuve de paiement : ' + uploadedUrl : '(Preuve de paiement à envoyer séparément)')
    );
    document.getElementById('waBtn').href = 'https://wa.me/22962617627?text=' + waText;

    form.style.display = 'none';
    successView.classList.add('show');
  }

  document.getElementById('resetBtn').addEventListener('click', function(){
    form.reset();
    paymentContinueBtn.disabled = true;
    updateClubField();
    phoneInput.setCountry('bj');
    phoneInput.setNumber('');
    clearFile();
    ['fullname','classification','email','whatsapp','motivation','clubName','otherProfile','proofFile'].forEach(clearError);
    document.querySelectorAll('[data-touched]').forEach(el => el.removeAttribute('data-touched'));
    form.style.display = 'block';
    successView.classList.remove('show');
    document.body.classList.remove('registration-open');
    goToStep(1);
  });
})();
