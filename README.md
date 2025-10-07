# 📊 Correlation Learning Applet

This web-based applet helps Grade 11 and 12 students understand the **concept of correlation** in statistics by **automating calculations** and showing complete step-by-step solutions. It allows learners to focus on **conceptual understanding** without getting overwhelmed by manual computation.

---

## 🎯 Purpose

Traditional methods require students to solve correlation problems with calculators and pen-paper. This applet:
- Frees students from repetitive calculations
- Lets them experiment with different datasets
- Shows full working steps just like a textbook
- Reinforces conceptual clarity by focusing on the *"why"* behind the formulas

---

## 📱 Features

### 🔹 Page 1: Manual Data Entry + Visual Computation (`index.html`)
- Input paired `x` and `y` values manually (auto-row add on enter)
- Choose from 3 correlation formulas:
  1. **Raw scores**  
     \[
     r = \frac{n\sum xy - (\sum x)(\sum x)}{\sqrt{n\sum x^2 - (\sum x)^2} \cdot \sqrt{n\sum y^2 - (\sum y)^2}}
     \]
  2. **Assumed Mean Method (UV)**  
     \[
     r = \frac{n\sum uv - (\sum u)(\sum v)}{\sqrt{n\sum u^2 - (\sum u)^2} \cdot \sqrt{n\sum v^2 - (\sum v)^2}}
     \]
  3. **Mean-Deviation Method**  
     \[
     r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2} \cdot \sqrt{\sum (y - \bar{y})^2}}
     \]
- Step-by-step calculations shown only after user clicks "Calculate"
- Final correlation `r` displayed with interpretation (e.g., "strong positive correlation")
- Interactive scatter plot with regression line for visual understanding

### 🔹 Page 2: Smart Formula Suggestion Tool (`shortsums.html`)
- Accepts flexible inputs:  
  \( n, \sum x, \sum y, \sum x^2, \sum y^2, \sum xy, \bar{x}, \bar{y}, s_x, s_y, s_x^2, s_y^2, \text{Cov}(x, y), \sum (x - \bar{x})^2, \sum (y - \bar{y})^2 \), etc.
- Dynamically suggests usable formulas based on provided inputs:
  1. **Raw Score Method**  
     \[
     r = \frac{n\sum xy - (\sum x)(\sum y)}{\sqrt{[n\sum x^2 - (\sum x)^2][n\sum y^2 - (\sum y)^2]}}
     \]
  2. **Mean-Deviation Method**  
     \[
     r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \cdot \sum (y - \bar{y})^2}}
     \]
  3. **Covariance-Based Method**  
     \[
     r = \frac{\text{Cov}(x, y)}{s_x \cdot s_y}
     \]
  4. **Mean-Deviation Normalized Method**  
     \[
     r = \frac{\sum (x - \bar{x})(y - \bar{y})}{n \cdot s_x \cdot s_y}
     \]
  5. **Mean Product Form**  
     \[
     r = \frac{\sum xy - n \cdot \bar{x} \cdot \bar{y}}{n \cdot s_x \cdot s_y}
     \]
- Detailed in-place step-by-step calculation display with LaTeX rendering
- Visually indicates which formulas can be used with currently provided values
- Error handling for special cases (zero denominator, negative square roots)

---

## 🧑‍🎓 User Experience (UX)

### Design Philosophy
- ✅ **Engaging visual experience** with subtle gradients and responsive animations
- ✅ **Mobile-first** design, works well on all screen sizes
- ✅ **Minimalist** interface with smooth spacing and transitions
- ✅ **Visual cues** to guide users through the calculation process

### Interactive Elements
- ✅ **Auto row generation** for x-y input (triggered by Enter key in the last field)
- ✅ **Validation** to ensure paired values and sufficient data points
- ✅ **Interactive scatter plot** with regression line for visual insights
- ✅ **Real-time formula suggestion** based on available statistics
- ✅ **Animated formula cards** with clear visual indicators

### Educational Focus
- ✅ **Detailed step-by-step solutions** with mathematical notation
- ✅ **In-place formula substitution** to help students visualize the calculation process
- ✅ **Clear final interpretation** of correlation coefficient values
- ✅ **Error messages** that explain mathematical constraints (e.g., division by zero)

---

## 🎨 UI Components

### Global Elements
- Consistent color scheme (blue gradient theme)
- Card-based layout with subtle shadows and borders
- Custom input styling with focused states
- Animated buttons and interactive elements
- Responsive design that works on mobile and desktop

### Data Entry Page
- Interactive data table with auto-row addition
- Formula selection dropdown
- Dynamic calculation viewing
- Enhanced scatter plot visualization

### Formula Suggestion Page
- Interactive formula cards that update based on input
- Visual indication of available formulas
- Detailed step-by-step solution display
- Intelligent input handling

---

## ⚙️ Tech Stack

| Layer           | Technology                              |
|----------------|----------------------------------------|
| Frontend       | HTML, Tailwind CSS, Vanilla JS         |
| Math Rendering | MathJax for LaTeX formula display      |
| Visualization  | Chart.js (scatter plot & regression line) |
| Hosting        | GitHub Pages                           |
| Backend        | None (client-side only)                |

---

## 📂 Project Structure

```
correlation-applet/
├── home/
│   └── index.html              # Home Page (main entry point)
├── accounts/
│   ├── index.html              # Accounts Overview Page
│   └── journal/
│       └── index.html          # Journal Page (blank for now)
├── statistics/
│   ├── correl-regression/
│   │   ├── index.html          # Correlation + Regression Applet
│   │   └── correlation.js      # Logic for Correlation + Regression
│   ├── probability/
│   │   └── index.html          # Probability Calculator (placeholder)
│   ├── formula-suggester/
│   │   ├── index.html          # Formula Suggestion Tool
│   │   └── formula-suggester.js # Logic for Formula Suggester
│   └── time-series/
│       └── index.html          # Time Series Analysis Page (blank for now)
├── shared/
│   ├── js/
│   │   ├── common.js           # Handles sidebar and global navigation
│   │   └── utils.js            # Shared helper functions (formatting, interpretations)
│   └── css/
│       └── styles.css          # Shared CSS styles
├── README.md                   # Project documentation
└── .nojekyll                   # Allows use of folders starting with `_` on GitHub Pages
```

---

## 🛠️ Enhancement Guide

### Adding New Correlation Formulas

1. Add the formula definition to `ALL_FORMULAS` array in `formula-suggester.js`:
   ```javascript
   {
     id: 'uniqueId',
     name: 'Display Name',
     latex: `r = \\frac{...formula in LaTeX...}`,
     requiredInputs: ['val-input1', 'val-input2', ...],
     calculator: 'calculatorMethodName'
   }
   ```

2. Implement the calculator method in the `FormulaSuggester` class:
   ```javascript
   calculatorMethodName(values, config) {
     // Extract needed values
     const { value1, value2, ... } = values;
     
     // Calculate step by step
     let stepsHTML = `<div class="bg-white p-5 rounded-xl shadow-md border border-gray-200">...`;
     
     // Return result object
     return { r: calculatedValue, stepsHtml: stepsHTML };
   }
   ```

### UI Customization

- Color schemes can be adjusted via Tailwind classes
- Input styling can be modified in the `<style>` section of each HTML file
- Container layouts are defined in the HTML grid structure
- Animation timings are set in CSS transition properties

### Future Enhancements

- Implementing additional correlation formulas
- Adding export/save functionality for calculations
- Supporting CSV data import
- Implementing multiple language support
- Adding a comparative analysis tool for different formulas

---

## 🗺️ Navigation Management

The sidebar navigation is **completely dynamic** and managed through a single file: `shared/js/common.js`. This means you can add, remove, or reorder navigation links without touching any HTML files.

### How to Add a New Page:

1. **Create your new page** in the appropriate directory (e.g., `statistics/new-tool/index.html`)
2. **Edit `shared/js/common.js`** and add your page to the `navigationData` array:

```javascript
const navigationData = [
    // ... existing entries ...
    { id: 'navNewTool', text: 'New Tool', href: 'statistics/new-tool/index.html', isHeader: false, parent: 'statisticsHeader' },
];
```

3. **That's it!** The new page will automatically appear in the sidebar on all pages.

### Navigation Data Structure:

- **Top-level page**: `{ id: 'navHome', text: 'Home Page', href: 'home/index.html', isHeader: false }`
- **Section header**: `{ id: 'statisticsHeader', text: 'Statistics', isHeader: true }`
- **Sub-page**: `{ id: 'navTool', text: 'Tool Name', href: 'statistics/tool/index.html', isHeader: false, parent: 'statisticsHeader' }`

### Key Features:

- **Automatic path calculation**: The system automatically calculates correct relative paths based on the current page location
- **Active page highlighting**: The current page is automatically highlighted in the sidebar
- **No HTML editing required**: All navigation changes are made in one JavaScript file
- **Responsive design**: Works on all screen sizes with mobile-friendly sidebar toggle
