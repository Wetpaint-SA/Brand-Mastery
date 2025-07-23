
document.addEventListener("DOMContentLoaded", function () {
    const sections = {
        audit:        [5, 7, 8, 9, 10, 11],
        strategy:     [15, 16, 17, 18, 19, 20, 21, 22, 23],
        media:        [25, 26, 27, 28, 29, 30],
        creative:     [32, 33, 34, 35, 36, 37, 38],
        social:       [40, 41, 42, 43, 44, 45, 46, 47],
        digital:      [49, 50, 51, 52, 53, 54, 55, 56],
        management:   [58, 59, 60, 61, 62],
        roi:          [64, 65, 66, 67, 68, 69]
    };

    function logPersonalInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        console.log("=== Personal Info from Page 1 ===");
        console.log(`First Name: ${urlParams.get("fname")}`);
        console.log(`Last Name: ${urlParams.get("lname")}`);
        console.log(`Company: ${urlParams.get("company")}`);
        console.log(`Email: ${urlParams.get("email")}`);
    }

    function getSectionAverage(fieldIds) {
        let total = 0;
        let count = 0;
        fieldIds.forEach(id => {
            const selected = document.querySelector(`input[name="wpforms[fields][${id}][]"]:checked`);
            if (selected) {
                total += parseInt(selected.value);
                count++;
            }
        });
        return count ? Math.round((total / (count * 10)) * 100) : 0;
    }

    function getAllAverages() {
        const results = {};
        for (let section in sections) {
            const avg = getSectionAverage(sections[section]);
            results[section] = avg;
            const hiddenField = document.querySelector(`#wpforms-21961-field_${getHiddenFieldId(section)}`);
            if (hiddenField) hiddenField.value = avg;
        }
        console.log("=== All Section Averages ===", results);
        return results;
    }

    function getHiddenFieldId(section) {
        return {
            audit: 100, strategy: 101, media: 102, creative: 103,
            social: 104, digital: 105, management: 106, roi: 107
        }[section];
    }

    

    function redirectToPage3() {
        const params = new URLSearchParams(window.location.search);
        const personal = {
            fname: params.get("fname") || '',
            lname: params.get("lname") || '',
            company: params.get("company") || '',
            email: params.get("email") || ''
        };
        const scores = getAllAverages();
        const query = new URLSearchParams({ ...personal, ...scores });
        const redirectURL = `https://staging.wetpaint.co.za/bma-results/?${query.toString()}`;
        console.log("Redirecting to:", redirectURL);
        document.body.innerHTML = '<p style="text-align:center;font-size:1.5rem;">Calculating your results... Redirecting.</p>';
        window.location.href = redirectURL;
    }

    function disableWPFormsScroll() {
        if (window.wpforms && window.wpforms.scrollToError) {
            window.wpforms.scrollToError = function () { return false; };
        }
        if (window.wpformsScrollToError) {
            window.wpformsScrollToError = function () { return false; };
        }
        document.addEventListener('wpformsPageChange', function (e) {
            e.preventDefault();
            return false;
        });
        document.addEventListener('wpformsFormSubmitError', function (e) {
            e.preventDefault();
            return false;
        });
    }

    

    logPersonalInfo();
    disableWPFormsScroll();

    setTimeout(() => {
        autoFillFirstQuestion();
        updateProgressBar(); // Run once on load
    }, 100);

    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
        input.addEventListener('change', function () {
            getAllAverages();
        });
    });

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1) {
                    const inputs = node.querySelectorAll ? node.querySelectorAll('input[type="checkbox"], input[type="radio"]') : [];
                    inputs.forEach(input => {
                        input.addEventListener('change', function () {
                            getAllAverages();
                        });
                    });
                }
            });
        });
    });

    const formContainer = document.querySelector('#wpforms-form-21961') || document.body;
    observer.observe(formContainer, { childList: true, subtree: true });

    const form = document.querySelector('#wpforms-form-21961');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Native form submit intercepted — redirecting now...");
            redirectToPage3();
        });

        // ✅ Click fallback to ensure progress updates
        form.addEventListener('click', function (e) {
            if (
                e.target.matches('.wpforms-page-next') ||
                e.target.matches('.wpforms-page-prev') ||
                e.target.matches('.wpforms-submit')
            ) {
                disableScrolling();
                setTimeout(updateProgressBar, 150);
            }
        });

        // ✅ MutationObserver to auto-update progress when page visibility changes
        const pages = document.querySelectorAll('.wpforms-page');
        const pageObserver = new MutationObserver(updateProgressBar);
        pages.forEach(page => {
            pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
        });
    }

    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = Element.prototype.scrollIntoView;

    let scrollingDisabled = false;

    function disableScrolling() {
        scrollingDisabled = true;
        setTimeout(() => { scrollingDisabled = false; }, 1000);
    }

    window.scrollTo = function (...args) {
        if (!scrollingDisabled) {
            originalScrollTo.apply(this, args);
        }
    };

    Element.prototype.scrollIntoView = function (...args) {
        if (!scrollingDisabled) {
            originalScrollIntoView.apply(this, args);
        }
    };
});
