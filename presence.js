(function(){
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzebqqol';
  const form = document.getElementById('presenceForm');
  const successView = document.getElementById('presenceSuccess');
  const submitButton = document.getElementById('submitPresence');
  const clubField = document.getElementById('clubField');
  const clubNameInput = document.getElementById('clubName');
  const whatsappInput = document.getElementById('whatsapp');
  const phoneInput = window.intlTelInput(whatsappInput, {
    initialCountry: 'bj', preferredCountries: ['bj', 'ci', 'tg', 'ng', 'fr'],
    separateDialCode: true, nationalMode: true, strictMode: true,
    loadUtils: () => import('https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js')
  });

  const translations = {
    fr: {
      pageTitle: 'Réunion statutaire | Feuille de présence',
      pageDescription: 'Validez votre présence pendant la réunion statutaire des Clubs Rotaract de Cotonou le Nautile et Satellite.',
      kicker: 'Clubs Rotaract de Cotonou', heroTitle: 'Réunion <span>statutaire</span>',
      eventDate: '14 septembre 2026', eventTime: 'À partir de 19h30', eventMode: 'Réunion en ligne',
      intro: 'Merci d’enregistrer votre présence à cette réunion statutaire des Clubs Rotaract de Cotonou le Nautile et Satellite.',
      note: 'Cette fiche est à remplir pendant la réunion pour valider votre présence.', formTitle: 'Feuille de présence',
      formSubtitle: 'Remplissez cette fiche pendant la réunion afin d’enregistrer votre présence.',
      fullnameLabel: 'Noms et prénoms <span class="req">*</span>', classificationLabel: 'Classification <span class="req">*</span>',
      clubMemberLabel: 'Faites-vous partie d\'un club ? <span class="req">*</span>', yes: 'Oui', no: 'Non',
      clubNameLabel: 'Nom du club <span class="req">*</span>', emailLabel: 'Adresse e-mail <span class="req">*</span>',
      whatsappLabel: 'Numéro WhatsApp <span class="req">*</span>', messageLabel: 'Message ou observation <span class="optional">(facultatif)</span>',
      submit: 'Valider ma présence', formNote: 'Aucun paiement ni justificatif n\'est demandé pour cette validation.',
      successTitle: 'Vous êtes invité(e) à l’événement', successText: 'Merci, votre présence a bien été enregistrée. Nous vous invitons à participer à la réunion statutaire du 14 septembre 2026 à 19h30, en ligne.',
      eventLink: 'Voir l’événement sur la page principale', reset: 'Modifier ma réponse',
      fullnamePlaceholder: 'Ex : BOGNON Dona Gracias Yeratel', classificationPlaceholder: 'Ex : Développeur web, Étudiant(e)…',
      clubPlaceholder: 'Ex : Rotaract Club de Cotonou', emailPlaceholder: 'vous@exemple.com', messagePlaceholder: 'Une précision à nous communiquer ?'
    },
    en: {
      pageTitle: 'Statutory Meeting | Attendance Sheet',
      pageDescription: 'Record your attendance during the statutory meeting of the Rotaract Clubs of Cotonou Nautile and Satellite.',
      kicker: 'Rotaract Clubs of Cotonou', heroTitle: 'Statutory <span>meeting</span>',
      eventDate: 'September 14, 2026', eventTime: 'From 7:30 PM', eventMode: 'Online meeting',
      intro: 'Please record your attendance at this statutory meeting of the Rotaract Clubs of Cotonou Nautile and Satellite.',
      note: 'This sheet must be completed during the meeting to validate your attendance.', formTitle: 'Attendance sheet',
      formSubtitle: 'Complete this form during the meeting to record your attendance.',
      fullnameLabel: 'Full name <span class="req">*</span>', classificationLabel: 'Profile <span class="req">*</span>',
      clubMemberLabel: 'Are you a member of a club? <span class="req">*</span>', yes: 'Yes', no: 'No',
      clubNameLabel: 'Club name <span class="req">*</span>', emailLabel: 'Email address <span class="req">*</span>',
      whatsappLabel: 'WhatsApp number <span class="req">*</span>', messageLabel: 'Message or note <span class="optional">(optional)</span>',
      submit: 'Validate my attendance', formNote: 'No payment or proof is required for this validation.',
      successTitle: 'You are invited to the event', successText: 'Thank you, your attendance has been recorded. We invite you to join the statutory meeting on September 14, 2026 at 7:30 PM, online.',
      eventLink: 'View the event on the main page', reset: 'Change my response',
      fullnamePlaceholder: 'E.g. BOGNON Dona Gracias Yeratel', classificationPlaceholder: 'E.g. Web developer, Student…',
      clubPlaceholder: 'E.g. Rotaract Club of Cotonou', emailPlaceholder: 'you@example.com', messagePlaceholder: 'Anything you would like to tell us?'
    }
  };

  function applyLanguage(language){
    const dictionary = translations[language] || translations.fr;
    document.documentElement.lang = language;
    document.title = dictionary.pageTitle;
    document.querySelector('meta[name="description"]').setAttribute('content', dictionary.pageDescription);
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.innerHTML = dictionary[element.dataset.i18n] || element.innerHTML;
    });
    const placeholders = {
      fullname: dictionary.fullnamePlaceholder, classification: dictionary.classificationPlaceholder,
      clubName: dictionary.clubPlaceholder, email: dictionary.emailPlaceholder, message: dictionary.messagePlaceholder
    };
    Object.entries(placeholders).forEach(([name, value]) => { form.elements[name].placeholder = value; });
    document.querySelectorAll('.language-btn').forEach(button => button.classList.toggle('active', button.dataset.language === language));
    localStorage.setItem('nautile-language', language);
  }

  document.querySelectorAll('.language-btn').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.language)));
  applyLanguage(localStorage.getItem('nautile-language') || 'fr');

  function setError(field, message){
    const element = document.querySelector('[data-error-for="' + field + '"]');
    if(element) element.textContent = message;
  }

  function updateClubField(){
    const selected = form.querySelector('input[name="clubMember"]:checked');
    const isMember = selected && selected.value === 'Oui';
    clubField.hidden = !isMember;
    clubNameInput.required = isMember;
    if(!isMember) clubNameInput.value = '';
  }

  form.querySelectorAll('input[name="clubMember"]').forEach(input => input.addEventListener('change', updateClubField));
  updateClubField();

  function validate(){
    let valid = true;
    ['fullname', 'classification', 'email'].forEach(name => {
      const input = form.elements[name];
      if(!input.value.trim() || (input.type === 'email' && !input.checkValidity())){
        setError(name, name === 'email' ? 'Adresse e-mail invalide.' : 'Ce champ est requis.');
        valid = false;
      } else setError(name, '');
    });
    const phoneValid = phoneInput.isValidNumber();
    setError('whatsapp', phoneValid ? '' : 'Numéro WhatsApp invalide.');
    if(!phoneValid) valid = false;
    const clubMember = form.querySelector('input[name="clubMember"]:checked');
    setError('clubMember', clubMember ? '' : 'Merci d’indiquer si vous faites partie d’un club.');
    if(!clubMember) valid = false;
    if(clubMember && clubMember.value === 'Oui' && !clubNameInput.value.trim()){
      setError('clubName', 'Merci d’indiquer le nom de votre club.');
      valid = false;
    } else setError('clubName', '');
    return valid;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!validate()) return;
    const clubMember = form.querySelector('input[name="clubMember"]:checked').value;
    const data = {
      fullname: form.fullname.value.trim(), classification: form.classification.value.trim(),
      clubMember, clubName: clubNameInput.value.trim(), email: form.email.value.trim(),
      whatsapp: phoneInput.getNumber(), message: form.message.value.trim() || 'Aucune observation'
    };
    const confirmation = await Swal.fire({
      title: 'Valider votre présence ?', text: 'Votre présence sera enregistrée pour cette réunion.',
      icon: 'question', showCancelButton: true, confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Vérifier encore', confirmButtonColor: '#0B3D91', reverseButtons: true
    });
    if(!confirmation.isConfirmed) return;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours…';
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, { method: 'POST', headers: {'Accept': 'application/json'}, body: new URLSearchParams({
        'Nom et prénoms': data.fullname, 'Classification': data.classification,
        'Membre d’un club': data.clubMember, 'Nom du club': data.clubName || 'Non concerné',
        'E-mail': data.email, 'WhatsApp': data.whatsapp, 'Message': data.message,
        '_subject': 'Présence enregistrée — Réunion statutaire'
      })});
      if(!response.ok) throw new Error('Formspree submission failed');
      document.getElementById('presenceRecap').innerHTML = '<div><span>Nom</span><span>' + data.fullname + '</span></div><div><span>Club</span><span>' + (data.clubName || 'Non concerné') + '</span></div><div><span>Événement</span><span>Réunion statutaire</span></div><div><span>Date</span><span>14 septembre 2026 à 19h30</span></div>';
      form.style.display = 'none';
      successView.classList.add('show');
    } catch(error){
      Swal.fire({icon: 'error', title: 'Envoi impossible', text: 'Vérifiez votre connexion puis réessayez.'});
    } finally {
      submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Valider ma présence';
    }
  });

  document.getElementById('resetPresence').addEventListener('click', () => {
    form.reset(); updateClubField(); phoneInput.setCountry('bj'); phoneInput.setNumber('');
    form.style.display = 'block'; successView.classList.remove('show');
  });
})();