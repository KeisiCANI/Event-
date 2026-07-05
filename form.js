/* =============================================
   MAREA Event Planner — Form Validation
   js/form.js
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ---- Helper: show / clear field error ---- */
    /**
     * @param {string} fieldId   - input element id
     * @param {string} errorId   - error span id
     * @param {string} [msg]     - error message (empty = clear)
     * @returns {boolean}        - true = valid, false = invalid
     */
    function setError(fieldId, errorId, msg) {
        var field = document.getElementById(fieldId);
        var span  = document.getElementById(errorId);
        if (!field || !span) return !msg;

        if (msg) {
            span.textContent = msg;
            field.classList.add('error');
            return false;
        }
        span.textContent = '';
        field.classList.remove('error');
        return true;
    }

    /* ---- Helper: get all checked checkboxes in a group ---- */
    function getCheckedBoxes(groupId) {
        var group = document.getElementById(groupId);
        if (!group) return [];
        return Array.from(group.querySelectorAll('input[type="checkbox"]:checked'));
    }

    /* ---- Helper: get selected radio value ---- */
    function getRadioValue(name) {
        var radios = document.querySelectorAll('input[type="radio"][name="' + name + '"]');
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) return radios[i].value;
        }
        return '';
    }

    /* ---- Email validation ---- */
    function isValidEmail(email) {
        // Must contain @, @ must come before . , after last . at least 2 chars
        var atIdx  = email.indexOf('@');
        var dotIdx = email.lastIndexOf('.');
        return (
            atIdx > 0 &&
            dotIdx > atIdx + 1 &&
            email.length - dotIdx > 2
        );
    }

    /* ---- Phone validation: XXX-XXXXXXX ---- */
    function isValidPhone(phone) {
        // Optional field, but if filled must match XXX-XXXXXXX
        if (!phone) return true;
        return /^\d{3}-\d{7}$/.test(phone);
    }

    /* ==============================================
       DRAG & DROP FILE UPLOAD (W3C File API)
       ============================================== */
    var dropZone  = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');
    var dropName  = document.getElementById('dropFileName');
    var filePreview = document.getElementById('filePreview');
    var uploadedFile = null;

    var ALLOWED_TYPES  = ['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg','image/png'];
    var MAX_BYTES = 10 * 1024 * 1024; // 10 MB

    function handleFile(file) {
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            dropName.textContent  = '⚠ File type not allowed. Use PDF, DOC, JPG or PNG.';
            dropName.style.color  = 'var(--color-error)';
            uploadedFile = null;
            return;
        }
        if (file.size > MAX_BYTES) {
            dropName.textContent = '⚠ File exceeds 10 MB limit.';
            dropName.style.color = 'var(--color-error)';
            uploadedFile = null;
            return;
        }

        uploadedFile = file;
        dropName.textContent = '✔ ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        dropName.style.color = 'var(--color-gold)';

        // Image preview using FileReader API
        if (file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function (e) {
                filePreview.src = e.target.result;
                filePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            filePreview.style.display = 'none';
            filePreview.src = '';
        }
    }

    if (dropZone && fileInput) {
        // Click to browse
        dropZone.addEventListener('click', function () { fileInput.click(); });

        // Keyboard accessibility
        dropZone.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
        });

        // File input change
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) { handleFile(this.files[0]); }
        });

        // Drag events
        dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', function () {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            var files = e.dataTransfer.files;
            if (files && files[0]) { handleFile(files[0]); }
        });
    }

    /* ==============================================
       FORM VALIDATION & SUBMISSION
       ============================================== */
    var form = document.getElementById('bookForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var isValid = true;

        /* ---- 1. Required text fields ---- */
        var fname = document.getElementById('fname')  ? document.getElementById('fname').value.trim()  : '';
        var lname = document.getElementById('lname')  ? document.getElementById('lname').value.trim()  : '';

        if (!fname) {
            isValid = setError('fname', 'fnameError', 'Emri është i detyrueshëm.') && isValid;
        } else {
            setError('fname', 'fnameError', '');
        }

        if (!lname) {
            isValid = setError('lname', 'lnameError', 'Mbiemri është i detyrueshëm.') && isValid;
        } else {
            setError('lname', 'lnameError', '');
        }

        /* ---- 2. Email ---- */
        var emailVal = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
        if (!emailVal) {
            isValid = setError('email', 'emailError', 'Email-i është i detyrueshëm.') && isValid;
        } else if (!isValidEmail(emailVal)) {
            isValid = setError('email', 'emailError', 'Formati i email-it është i pasaktë (duhet @ dhe . me min 2 karaktere pas tij).') && isValid;
        } else {
            setError('email', 'emailError', '');
        }

        /* ---- 3. Phone (optional, format if filled) ---- */
        var phoneEl = document.getElementById('phone');
        if (phoneEl) {
            var phoneVal = phoneEl.value.trim();
            if (phoneVal && !isValidPhone(phoneVal)) {
                isValid = setError('phone', 'phoneError', 'Formati duhet të jetë XXX-XXXXXXX (p.sh. 069-1234567).') && isValid;
            } else {
                setError('phone', 'phoneError', '');
            }
        }

        /* ---- 4. Password ---- */
        var passEl  = document.getElementById('password');
        var pass2El = document.getElementById('password2');
        var passVal = passEl  ? passEl.value  : '';
        var pass2Val= pass2El ? pass2El.value : '';

        if (!passVal) {
            isValid = setError('password', 'passwordError', 'Fjalëkalimi është i detyrueshëm.') && isValid;
        } else if (passVal.length < 6) {
            isValid = setError('password', 'passwordError', 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.') && isValid;
        } else {
            setError('password', 'passwordError', '');
        }

        if (!pass2Val) {
            isValid = setError('password2', 'password2Error', 'Konfirmo fjalëkalimin.') && isValid;
        } else if (passVal !== pass2Val) {
            isValid = setError('password2', 'password2Error', 'Fjalëkalimet nuk përputhen.') && isValid;
        } else {
            setError('password2', 'password2Error', '');
        }

        /* ---- 5. Gender (radio — cannot be empty) ---- */
        var genderVal   = getRadioValue('gender');
        var genderError = document.getElementById('genderError');
        if (!genderVal) {
            if (genderError) genderError.textContent = 'Zgjidhni gjininë.';
            isValid = false;
        } else {
            if (genderError) genderError.textContent = '';
        }

        /* ---- 6. Event type (select — required) ---- */
        var eventTypeEl = document.getElementById('eventType');
        if (eventTypeEl && !eventTypeEl.value) {
            isValid = setError('eventType', 'eventTypeError', 'Zgjidhni llojin e eventit.') && isValid;
        } else if (eventTypeEl) {
            setError('eventType', 'eventTypeError', '');
        }

        /* ---- 7. Guest count (select — required) ---- */
        var guestEl = document.getElementById('guestCount');
        if (guestEl && !guestEl.value) {
            isValid = setError('guestCount', 'guestCountError', 'Zgjidhni rangën e të ftuarve.') && isValid;
        } else if (guestEl) {
            setError('guestCount', 'guestCountError', '');
        }

        /* ---- 8. Budget (number — required) ---- */
        var budgetEl  = document.getElementById('budget');
        var budgetErr = document.getElementById('budgetError');
        if (budgetEl) {
            var budgetVal = budgetEl.value.trim();
            if (!budgetVal) {
                isValid = setError('budget', 'budgetError', 'Vendosni buxhetin e përafërt.') && isValid;
            } else if (isNaN(budgetVal) || Number(budgetVal) < 100) {
                isValid = setError('budget', 'budgetError', 'Buxheti minimal është €100.') && isValid;
            } else {
                setError('budget', 'budgetError', '');
            }
        }

        /* ---- 9. At least one checkbox ---- */
        var checked    = getCheckedBoxes('servicesGroup');
        var cbError    = document.getElementById('checkboxError');
        if (checked.length === 0) {
            if (cbError) cbError.textContent = 'Zgjidhni të paktën një shërbim.';
            isValid = false;
        } else {
            if (cbError) cbError.textContent = '';
        }

        /* ---- If not valid, scroll to first error ---- */
        if (!isValid) {
            var firstError = form.querySelector('.field-error:not(:empty), .error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        /* ---- Build summary and display in DOM ---- */
        var services    = checked.map(function (cb) { return cb.value; }).join(', ');
        var eventDate   = document.getElementById('eventDate')  ? document.getElementById('eventDate').value  : '';
        var heardFrom   = document.getElementById('heardFrom')  ? document.getElementById('heardFrom').value  : '';
        var message     = document.getElementById('message')    ? document.getElementById('message').value.trim() : '';
        var budgetDisplay = document.getElementById('budget')   ? '€' + document.getElementById('budget').value : '';
        var guestDisplay  = document.getElementById('guestCount') ? document.getElementById('guestCount').value : '';
        var eventTypeDisp = document.getElementById('eventType')  ? document.getElementById('eventType').value  : '';
        var fileInfo    = uploadedFile ? uploadedFile.name : 'Nuk u ngarkua skedar.';

        var result = document.getElementById('formResult');
        if (result) {
            result.innerHTML =
                '<div class="form-result-icon">🎉</div>'
              + '<div class="form-result-text">'
              +   '<h4>Faleminderit, ' + fname + '! Kërkesa juaj u pranua.</h4>'
              +   '<p>Ekipi MAREA do t\'ju kontaktojë brenda 24 orësh.</p>'
              +   '<table style="margin-top:.8rem;border-collapse:collapse;font-size:.82rem;width:100%;">'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Emri:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + fname + ' ' + lname + '</td></tr>'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Email:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + emailVal + '</td></tr>'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Lloji:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + eventTypeDisp + '</td></tr>'
              +     (eventDate ? '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Data:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + eventDate + '</td></tr>' : '')
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Gjinia:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + genderVal + '</td></tr>'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Të ftuar:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + guestDisplay + '</td></tr>'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Buxheti:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + budgetDisplay + '</td></tr>'
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Shërbimet:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + services + '</td></tr>'
              +     (heardFrom ? '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Na gjetet:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + heardFrom + '</td></tr>' : '')
              +     '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Skedari:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + fileInfo + '</td></tr>'
              +     (message ? '<tr><td style="padding:.3rem .5rem;color:var(--color-text-light);">Mesazhi:</td>'
              +         '<td style="padding:.3rem .5rem;font-weight:600;">' + message + '</td></tr>' : '')
              +   '</table>'
              + '</div>';
            result.classList.add('show');
            result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        form.reset();
        uploadedFile = null;
        if (dropName)    { dropName.textContent = ''; }
        if (filePreview) { filePreview.style.display = 'none'; filePreview.src = ''; }
    });

    /* ---- Reset button ---- */
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.reset();
            uploadedFile = null;
            if (dropName)    dropName.textContent = '';
            if (filePreview) { filePreview.style.display = 'none'; filePreview.src = ''; }

            // Clear all errors
            form.querySelectorAll('.field-error').forEach(function (s) { s.textContent = ''; });
            form.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });

            var result = document.getElementById('formResult');
            if (result) { result.classList.remove('show'); result.innerHTML = ''; }
        });
    }

});