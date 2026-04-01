document.addEventListener('DOMContentLoaded', function() {
  const yearSelect = document.getElementById('vehicle-year');
  const makeSelect = document.getElementById('vehicle-make');
  const modelSelect = document.getElementById('vehicle-model');
  const trimSelect = document.getElementById('vehicle-trim');
  const cabSelect = document.getElementById('vehicle-cab');
  const validationMessage = document.getElementById('vehicle-validation-message');
  const atcButton = document.querySelector('.m-add-to-cart');
  const trimWrapper = document.getElementById('trim-wrapper');
  const cabWrapper = document.getElementById('cab-wrapper');

  if (!yearSelect) return;

  const allOptions = {
    make: Array.from(makeSelect.options),
    model: Array.from(modelSelect.options),
    trim: Array.from(trimSelect.options),
    cab: Array.from(cabSelect.options)
  };

  function initSelect(select, placeholder) {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    select.disabled = true;
  }

  function updateDropdown(targetSelect, optionsArr, filters, placeholder) {
    targetSelect.innerHTML = `<option value="">${placeholder}</option>`;
    let matchFound = false;
    const seenValues = new Set();

    optionsArr.forEach(opt => {
      if (opt.value === "") return;
      
      let match = true;
      for (const [attr, val] of Object.entries(filters)) {
        if (attr && opt.getAttribute(attr) !== val) {
          match = false;
          break;
        }
      }
      
      if (match) {
        const val = opt.value.trim();
        if (!seenValues.has(val)) {
          targetSelect.appendChild(opt.cloneNode(true));
          seenValues.add(val);
          matchFound = true;
        }
      }
    });
    targetSelect.disabled = !matchFound;
    return matchFound;
  }

  function validateAndSyncSteps() {
    const trimRequired = !trimSelect.disabled && trimSelect.options.length > 1;
    const cabRequired = !cabSelect.disabled && cabSelect.options.length > 1;
    const vehicleDone = yearSelect.value && makeSelect.value && modelSelect.value && (!trimRequired || trimSelect.value) && (!cabRequired || cabSelect.value);
    const colorPicker = document.querySelector('.product-color-picker');
    const setupPicker = document.querySelector('.product-setup-picker');
    
    const colorSelected = colorPicker ? colorPicker.querySelector('input:checked') : true; 
    const setupSelected = setupPicker ? setupPicker.querySelector('input:checked') : true;

    const allDone = vehicleDone && colorSelected && setupSelected;

    const step1 = document.getElementById('step-1-container');
    const step2 = document.getElementById('step-2-container');
    const step3 = document.getElementById('step-3-container');

    // Step 1 check
    if (vehicleDone) {
      if (step1) step1.classList.add('completed');
      if (step2) step2.classList.add('active');
      if (validationMessage) validationMessage.style.display = 'none';
    } else {
      if (step1) step1.classList.remove('completed');
      if (step2) step2.classList.remove('active');
      if (step3) step3.classList.remove('active');
      if (validationMessage && yearSelect.value) validationMessage.style.display = 'block';
    }

    // Step 2 check
    if (vehicleDone && colorSelected) {
      if (step2) step2.classList.add('completed');
      if (step3) step3.classList.add('active');
    } else {
      if (step2) step2.classList.remove('completed');
      if (step3) step3.classList.remove('active');
    }

    // Step 3 check
    if (allDone) {
      if (step3) step3.classList.add('completed');
    } else {
      if (step3) step3.classList.remove('completed');
    }

    const atcButtons = document.querySelectorAll('.m-add-to-cart');
    atcButtons.forEach(btn => {
      if (allDone) {
        btn.setAttribute('data-steps-complete', 'true');
        btn.style.opacity = '1';
      } else {
        btn.setAttribute('data-steps-complete', 'false');
        btn.style.opacity = '0.7';
      }
    });
  }

  function isConfigurationComplete() {
    const trimRequired = !trimSelect.disabled && trimSelect.options.length > 1;
    const cabRequired = !cabSelect.disabled && cabSelect.options.length > 1;
    const vehicleDone = yearSelect.value && makeSelect.value && modelSelect.value && (!trimRequired || trimSelect.value) && (!cabRequired || cabSelect.value);
    
    const colorPicker = document.querySelector('.product-color-picker');
    const setupPicker = document.querySelector('.product-setup-picker');
    const colorSelected = colorPicker ? colorPicker.querySelector('input:checked') : true; 
    const setupSelected = setupPicker ? setupPicker.querySelector('input:checked') : true;
    return vehicleDone && colorSelected && setupSelected;
  }

  yearSelect.addEventListener('change', function() {
    updateDropdown(makeSelect, allOptions.make, { 'data-year': this.value }, 'Select Make');
    initSelect(modelSelect, 'Select Model');
    initSelect(trimSelect, 'Select Trim');
    initSelect(cabSelect, 'Select Cab Size');
    if (trimWrapper) trimWrapper.style.display = 'none';
    if (cabWrapper) cabWrapper.style.display = 'none';
    validateAndSyncSteps();
  });

  makeSelect.addEventListener('change', function() {
    updateDropdown(modelSelect, allOptions.model, { 'data-make': this.value, 'data-year': yearSelect.value }, 'Select Model');
    initSelect(trimSelect, 'Select Trim');
    initSelect(cabSelect, 'Select Cab Size');
    if (trimWrapper) trimWrapper.style.display = 'none';
    if (cabWrapper) cabWrapper.style.display = 'none';
    validateAndSyncSteps();
  });

  modelSelect.addEventListener('change', function() {
    const hasTrim = updateDropdown(trimSelect, allOptions.trim, { 'data-model': this.value, 'data-year': yearSelect.value }, 'Select Trim');
    initSelect(cabSelect, 'Select Cab Size');
    if (this.value && hasTrim) {
      if (trimWrapper) trimWrapper.style.display = 'block';
    } else {
      if (trimWrapper) trimWrapper.style.display = 'none';
    }
    if (cabWrapper) cabWrapper.style.display = 'none';
    validateAndSyncSteps();
  });

  trimSelect.addEventListener('change', function() {
    const hasCab = updateDropdown(cabSelect, allOptions.cab, { 'data-trim': this.value, 'data-model': modelSelect.value, 'data-year': yearSelect.value }, 'Select Cab Size');
    if (this.value && hasCab) {
      if (cabWrapper) cabWrapper.style.display = 'block';
    } else {
      if (cabWrapper) cabWrapper.style.display = 'none';
    }
    validateAndSyncSteps();
  });

  cabSelect.addEventListener('change', () => validateAndSyncSteps());

  // Listen for Color and Setup changes
  document.addEventListener('change', function(e) {
    if (e.target.closest('.product-color-picker') || e.target.closest('.product-setup-picker')) {
      validateAndSyncSteps();
    }
  });

  // Intercept ATC clicks if steps aren't complete
  document.addEventListener('click', function(e) {
    const atcBtn = e.target.closest('.m-add-to-cart');
    if (atcBtn) {
      // Real-time check to be 100% sure, or fallback if attribute isn't set yet
      const isComplete = atcBtn.getAttribute('data-steps-complete') === 'true' || isConfigurationComplete();
      
      if (!isComplete) {
        const stepper = document.querySelector('.vehicle-config-stepper');
        if (stepper) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          const offset = 120; // Increased offset to see Step 1 clearly
          const elementPosition = stepper.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, true);

  // URL Parameters handling
  const urlParams = new URLSearchParams(window.location.search);
  const pYear = urlParams.get('year');
  const pMake = urlParams.get('make');
  const pModel = urlParams.get('model');

  if (pYear) {
    yearSelect.value = pYear;
    yearSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
      if (pMake) {
        makeSelect.value = pMake;
        makeSelect.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          if (pModel) {
            modelSelect.value = pModel;
            modelSelect.dispatchEvent(new Event('change'));
          }
        }, 100);
      }
    }, 100);
  }

  // Initial check
  setTimeout(() => validateAndSyncSteps(false), 500);

  // Re-run validation after AJAX variant updates
  document.addEventListener('variant:changed', function() {
    validateAndSyncSteps(false);
  });

  if (window.MinimogEvents) {
    MinimogEvents.subscribe(MinimogTheme.pubSubEvents.variantChange, function() {
      validateAndSyncSteps(false);
    });
  }

  // MutationObserver to catch any DOM changes within product info
  const productInfo = document.querySelector('.m-product-info, .m-main-product--info');
  if (productInfo) {
    const observer = new MutationObserver(() => validateAndSyncSteps(false));
    observer.observe(productInfo, { childList: true, subtree: true });
  }
});
