// --- Global Variables ---
let currentStep = 0;
let emissions = {
  electricity: 0,
  transport: 0,
  food: 0,
  shopping: 0
};

// --- Show only one step at a time ---
function showStep(step) {
  const allSteps = document.querySelectorAll(".question-step");
  allSteps.forEach(s => s.style.display = "none");
  const current = document.getElementById(`step${step}`);
  if (current) current.style.display = "block";
  currentStep = step;
}

// --- Go to next step ---
function nextStep() {
  showStep(currentStep + 1);
}

// --- Step 0: Electricity ---
function saveElectricity() {
  const selected = document.querySelector('input[name="electricity"]:checked');
  if (!selected) return alert("Please select your electricity usage!");

  let value = selected.value;
  if (value === "custom") {
    const custom = document.getElementById("electricity-custom").value;
    if (!custom) return alert("Please enter your custom electricity usage!");
    value = custom;
  }

  emissions.electricity = parseFloat(value) * 0.233; // kg CO₂ per kWh
  nextStep();
}

// --- Step 1: Transport selection ---
function showTransportDistance() {
  const selected = document.querySelector('input[name="vehicle"]:checked');
  if (!selected) return alert("Please select your transport mode!");

  const vehicle = selected.value;
  const distanceTitle = document.getElementById("distanceTitle");
  distanceTitle.textContent = `How many kilometers did you travel by ${vehicle}?`;

  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
  currentStep = 2;
}

// --- Step 2: Save transport distance ---
function saveTransportDistance() {
  const distance = parseFloat(document.getElementById("distance").value);
  if (isNaN(distance) || distance <= 0) return alert("Please enter valid distance!");

  const selectedVehicle = document.querySelector('input[name="vehicle"]:checked').value;
  const factors = {
    car: 0.12,
    bus: 0.06,
    train: 0.04,
    bike: 0.09,
    bicycle: 0,
    walk: 0
  };

  emissions.transport = distance * factors[selectedVehicle];
  nextStep();
}

// --- Step 3: Food type selection ---
function showFoodAmount() {
  const selected = document.querySelector('input[name="foodtype"]:checked');
  if (!selected) return alert("Please select your food type!");

  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
  currentStep = 4;
}

// --- Step 4: Food amount input ---
function saveFoodAmount() {
  const selectedFood = document.querySelector('input[name="foodtype"]:checked').value;
  const amount = parseFloat(document.getElementById("foodAmount").value);
  if (isNaN(amount) || amount <= 0) return alert("Please enter valid food amount!");

  const factors = {
    veg: 2,
    nonveg: 5,
    vegan: 1.5
  };

  emissions.food = amount * (factors[selectedFood] || 2);
  nextStep();
}

// --- Step 5: Shopping category ---
function showShoppingAmount() {
  const selected = document.querySelector('input[name="shoppingtype"]:checked');
  if (!selected) return alert("Please select your shopping type!");

  document.getElementById("step5").style.display = "none";
  document.getElementById("step6").style.display = "block";
  currentStep = 6;
}

// --- Step 6: Shopping spend ---
function saveShoppingAmount() {
  const amount = parseFloat(document.getElementById('shoppingAmountInput').value);
  if (isNaN(amount) || amount < 0) return alert("Please enter a valid amount!");

  // ₹100 spent ≈ 0.5 kg CO₂ emitted
  emissions.shopping = (amount / 100) * 0.5;

  nextStep();
}

// --- Step 7: Final calculation ---
function calculate() {
  const range = document.getElementById("timeRange")?.value || "weekly";
  const total = emissions.electricity + emissions.transport + emissions.food + emissions.shopping;
  let multiplier = 1;

  switch (range) {
    case "weekly": multiplier = 7; break;
    case "monthly": multiplier = 30; break;
    case "annual": multiplier = 365; break;
  }

  const totalEmission = total * multiplier;

  // ✅ Show final step
  showStep(7);

  // ✅ Update result text
  const resultEl = document.getElementById("result");
  resultEl.textContent = `🌍 Your estimated ${range} carbon footprint is ${totalEmission.toFixed(2)} kg CO₂.`;
  document.getElementById('result').style.color='#ffffff';

  // ✅ Delay to ensure canvas is visible before drawing
  setTimeout(() => {
    showChart(emissions);
  }, 200);

  // ✅ Save to localStorage
  localStorage.setItem("userEmissions", JSON.stringify(emissions));
  localStorage.setItem("userTotalEmission", totalEmission.toFixed(2));

  // Optional: Redirect after 2 seconds
  // setTimeout(() => { window.location.href = "tips.html"; }, 2000);
}

// --- Chart.js visualization ---
function showChart(data) {
  const ctx = document.getElementById("footprintChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Electricity", "Transport", "Food", "Shopping"],
      datasets: [{
        data: [data.electricity, data.transport, data.food, data.shopping],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// --- Initialize ---
document.addEventListener("DOMContentLoaded", () => {
  showStep(0);

  // Custom electricity input visibility
  document.querySelectorAll('input[name="electricity"]').forEach(input => {
    input.addEventListener("change", e => {
      const customInput = document.getElementById("electricity-custom");
      customInput.style.display = (e.target.value === "custom") ? "block" : "none";
    });
  });

  // Attach buttons
  document.querySelector("#step0 button").onclick = saveElectricity;
  document.querySelector("#step1 button").onclick = showTransportDistance;
  document.querySelector("#step2 button").onclick = saveTransportDistance;
  document.querySelector("#step3 button").onclick = showFoodAmount;
  document.querySelector("#step4 button").onclick = saveFoodAmount;
  document.querySelector("#step5 button").onclick = showShoppingAmount;
  document.querySelector("#step6 button").onclick = saveShoppingAmount;
  document.querySelector("#step6 .calculateBtn")?.addEventListener("click", calculate); // optional
});