(function () {
  "use strict";

  // Replace with your actual Supabase Edge Function URL before production testing.
  var FORM_ENDPOINT = "https://qodyofbkofuwxjvebpvj.supabase.co/functions/v1/database-access";

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initSmoothScroll();
    initContactForm();
    initFooterYear();
  });

  function initNavigation() {
    var menuToggle = document.querySelector(".menu-toggle");
    var siteNav = document.querySelector(".site-nav");

    if (!menuToggle || !siteNav) {
      return;
    }

    menuToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var targetId = anchor.getAttribute("href");
        if (!targetId || targetId.length < 2) {
          return;
        }

        var target = document.querySelector(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function initContactForm() {
    var forms = document.querySelectorAll(".js-contact-form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var feedback = form.querySelector(".form-feedback");
        var fullName = form.querySelector('input[name="fullName"]');
        var phone = form.querySelector('input[name="phone"]');
        var city = form.querySelector('input[name="city"]');
        var pincode = form.querySelector('input[name="pincode"]');
        var vehicleType = form.querySelector('input[name="vehicleType"]');
        var vehicleBrand = form.querySelector('input[name="vehicleBrand"]');
        var vehicleModel = form.querySelector('input[name="vehicleModel"]');
        var pickupAddress = form.querySelector('textarea[name="pickupAddress"]');
        var turnstileToken =
          form.querySelector('[name="cf-turnstile-response"]') ||
          document.querySelector('[name="cf-turnstile-response"]');

        var requiredFields = [
          fullName,
          phone,
          vehicleType,
          vehicleBrand,
          vehicleModel,
          pickupAddress,
          city,
          pincode,
        ];

        var missingField = requiredFields.find(function (field) {
          return !field || !field.value.trim();
        });

        if (missingField) {
          setFeedback(
            feedback,
            "Please fill in all required fields before submitting your query.",
            "error"
          );
          missingField.focus();
          return;
        }

        var phoneValue = phone.value.trim();
        var pincodeValue = pincode.value.trim();
        var basicPhonePattern = /^[+()\-\s\d]{7,20}$/;
        var indianPincodePattern = /^[1-9][0-9]{5}$/;

        if (!basicPhonePattern.test(phoneValue)) {
          setFeedback(feedback, "Please enter a valid phone number.", "error");
          phone.focus();
          return;
        }

        if (!indianPincodePattern.test(pincodeValue)) {
          setFeedback(feedback, "Please enter a valid 6-digit pincode.", "error");
          pincode.focus();
          return;
        }

        if (FORM_ENDPOINT.indexOf("YOUR-PROJECT-REF") !== -1) {
          setFeedback(
            feedback,
            "Form endpoint is not configured yet. Please update script.js with your Supabase function URL.",
            "error"
          );
          return;
        }

        if (!turnstileToken || !turnstileToken.value.trim()) {
          setFeedback(feedback, "Please complete the security check and try again.", "error");
          return;
        }

        var submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Submitting...";
        }

        var payload = {
          fullName: fullName.value.trim(),
          phoneNumber: phoneValue,
          vehicleType: vehicleType.value.trim(),
          vehicleBrand: vehicleBrand.value.trim(),
          vehicleModel: vehicleModel.value.trim(),
          pickupAddress: pickupAddress.value.trim(),
          city: city.value.trim(),
          pincode: pincodeValue,
          turnstileToken: turnstileToken.value.trim(),
        };

        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(function (response) {
            return response.json().catch(function () {
              return {};
            }).then(function (data) {
              return { ok: response.ok, data: data };
            });
          })
          .then(function (result) {
            if (!result.ok || !result.data || result.data.ok !== true) {
              var message = (result.data && result.data.message) ||
                "We could not submit your request right now. Please try again.";
              setFeedback(feedback, message, "error");
              return;
            }

            setFeedback(
              feedback,
              "Thank you. Your query has been received. We will contact you shortly.",
              "success"
            );
            form.reset();
          })
          .catch(function () {
            setFeedback(
              feedback,
              "Network error while submitting your request. Please try again.",
              "error"
            );
          })
          .finally(function () {
            if (window.turnstile && typeof window.turnstile.reset === "function") {
              window.turnstile.reset();
            }

            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Submit";
            }
          });
      });
    });
  }

  function initFooterYear() {
    var yearNode = document.getElementById("year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  function setFeedback(feedbackElement, text, type) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.textContent = text;
    feedbackElement.classList.remove("error", "success");
    feedbackElement.classList.add(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
