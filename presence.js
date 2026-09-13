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