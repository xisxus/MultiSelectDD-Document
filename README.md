# MultiSelect DD - jQuery Plugin Documentation

Version: 1.0.0  
License: MIT  
Dependencies: jQuery 3.x+

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Initialization Methods](#initialization-methods)
4. [Configuration Options](#configuration-options)
5. [API Methods](#api-methods)
6. [Events](#events)
7. [Data Sources](#data-sources)
8. [AJAX & Pagination](#ajax--pagination)
9. [.NET Integration Examples](#net-integration-examples)
10. [Styling & Customization](#styling--customization)
11. [Accessibility](#accessibility)
12. [Browser Support](#browser-support)

---

## Installation

### 1. Include Files

```html
<!-- jQuery (required) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- MultiSelect DD CSS -->
<link rel="stylesheet" href="path/to/multiselect-dd.css">

<!-- MultiSelect DD JS -->
<script src="path/to/multiselect-dd.js"></script>
```

### 2. File Structure

```
your-project/
├── wwwroot/
│   ├── css/
│   │   └── multiselect-dd.css
│   └── js/
│       └── multiselect-dd.js
```

---

## Quick Start

### Auto-Initialization

Simply add the `multiDD` class to any `<select>` element:

```html
<select class="multiDD" name="countries" multiple>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>
```

That's it! The plugin will automatically initialize on page load.

---

## Initialization Methods

### Method 1: Auto-Initialize (Recommended)

```html
<select class="multiDD" name="items" multiple>
    <option value="1">Item 1</option>
    <option value="2">Item 2</option>
</select>
```

### Method 2: Manual Initialization

```javascript
$('#mySelect').multiSelectDD();
```

### Method 3: With Custom Options

```javascript
$('#mySelect').multiSelectDD({
    placeholder: 'Choose items...',
    search: true,
    selectAll: false,
    max: 5
});
```

### Method 4: Initialize Multiple Selects

```javascript
$('.my-selects').multiSelectDD({
    placeholder: 'Select options'
});
```

---

## Configuration Options

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | string | `'Select item(s)'` | Placeholder text when nothing is selected |
| `search` | boolean | `true` | Enable/disable search box |
| `selectAll` | boolean | `true` | Show "Select All" option |
| `listAll` | boolean | `false` | Show all selected items in header (if false, shows first 2 items, then count) |
| `closeOnSelect` | boolean | `false` | Close dropdown after selecting an item |
| `allowClear` | boolean | `true` | Show close (×) button on selected items and clear all button |
| `max` | number/null | `null` | Maximum number of selections allowed |
| `min` | number/null | `null` | Minimum number of selections required |
| `data` | array | `[]` | Data array (overrides `<option>` tags) |

### AJAX Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ajax` | object/string | `null` | AJAX configuration or URL string |
| `ajax.url` | string | - | API endpoint URL |
| `ajax.method` | string | `'GET'` | HTTP method |
| `ajax.dataType` | string | `'json'` | Expected data type |
| `ajax.data` | object | `{}` | Additional parameters to send |
| `ajax.search` | boolean | `true` | Enable server-side search |

### Pagination Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pagination.enabled` | boolean | `false` | Enable infinite scroll pagination |
| `pagination.pageSize` | number | `20` | Items per page |
| `pagination.scrollThreshold` | number | `0.8` | Scroll percentage to trigger load (0.8 = 80%) |

### Callback Options

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onChange` | `(value, text, item)` | Fired when selection changes |
| `onSelect` | `(value, text, item)` | Fired when an item is selected |
| `onUnselect` | `(value, text, item)` | Fired when an item is unselected |
| `onLoad` | `(data)` | Fired when AJAX data is loaded |
| `onMaxReached` | `(max)` | Fired when max selections reached |

---

## API Methods

### Get/Set Values

```javascript
// Get selected values
var values = $('#mySelect').val();
// Returns: ['value1', 'value2']

// Set selected values
$('#mySelect').val(['value1', 'value2']);

// Using plugin method
$('#mySelect').multiSelectDD('val', ['value1', 'value2']);
```

### Enable/Disable

```javascript
// Disable
$('#mySelect').multiSelectDD('disable');
// Or jQuery way
$('#mySelect').prop('disabled', true);

// Enable
$('#mySelect').multiSelectDD('enable');
// Or jQuery way
$('#mySelect').prop('disabled', false);
```

### Clear Selection

```javascript
// Clear all selections
$('#mySelect').multiSelectDD('clear');

// Alternative
$('#mySelect').val([]);
```

### Select All

```javascript
// Select all options
$('#mySelect').multiSelectDD('selectAll');
```

### Add/Remove Options

```javascript
// Add single option
$('#mySelect').multiSelectDD('addOption', 'value4', 'Option 4', false);

// Add option via jQuery
$('#mySelect').append('<option value="value4">Option 4</option>');
$('#mySelect').multiSelectDD('refresh');

// Remove option
$('#mySelect').multiSelectDD('removeOption', 'value4');

// Remove via jQuery
$('#mySelect').find('option[value="value4"]').remove();
$('#mySelect').multiSelectDD('refresh');
```

### Refresh

```javascript
// Refresh the dropdown (reload from <select>)
$('#mySelect').multiSelectDD('refresh');
```

### Reload AJAX Data

```javascript
// Reload data from AJAX endpoint
$('#mySelect').multiSelectDD('reload');
```

### Destroy

```javascript
// Remove plugin and restore original select
$('#mySelect').multiSelectDD('destroy');
```

---

## Events

### jQuery Change Event

```javascript
$('#mySelect').on('change', function() {
    var selected = $(this).val();
    console.log('Selected:', selected);
});
```

### Custom Callbacks

```javascript
$('#mySelect').multiSelectDD({
    onChange: function(value, text, item) {
        console.log('Changed:', value, text);
    },
    onSelect: function(value, text, item) {
        console.log('Selected:', value, text);
    },
    onUnselect: function(value, text, item) {
        console.log('Unselected:', value, text);
    },
    onMaxReached: function(max) {
        alert('Maximum ' + max + ' items allowed!');
    }
});
```

---

## Data Sources

### 1. HTML Options (ViewBag in .NET)

```html
<select class="multiDD" name="countries" multiple>
    @foreach(var country in ViewBag.Countries)
    {
        <option value="@country.Value">@country.Text</option>
    }
</select>
```

### 2. JavaScript Array

```javascript
$('#mySelect').multiSelectDD({
    data: [
        { value: '1', text: 'Option 1', selected: false },
        { value: '2', text: 'Option 2', selected: true },
        { value: '3', text: 'Option 3', selected: false }
    ]
});
```

### 3. AJAX URL

```javascript
$('#mySelect').multiSelectDD({
    ajax: '/api/dropdown/getData'
});
```

### 4. AJAX with Configuration

```javascript
$('#mySelect').multiSelectDD({
    ajax: {
        url: '/api/dropdown/getData',
        method: 'POST',
        data: {
            categoryId: 5
        }
    }
});
```

---

## AJAX & Pagination

### Basic AJAX Setup

```javascript
$('#products').multiSelectDD({
    ajax: {
        url: '/api/products',
        method: 'GET'
    }
});
```

### Expected AJAX Response Format

```json
{
    "items": [
        { "value": "1", "text": "Product 1" },
        { "value": "2", "text": "Product 2" }
    ],
    "hasMore": true,
    "totalCount": 100
}
```

Or simplified:

```json
[
    { "value": "1", "text": "Product 1" },
    { "value": "2", "text": "Product 2" }
]
```

### Pagination Setup

```javascript
$('#products').multiSelectDD({
    ajax: '/api/products',
    pagination: {
        enabled: true,
        pageSize: 20,
        scrollThreshold: 0.8
    }
});
```

### Server-Side Parameters

The plugin automatically sends these parameters:

- `page` - Current page number (starts at 1)
- `pageSize` - Items per page
- `search` - Search term (if search is enabled)

### Server-Side Search

```javascript
$('#products').multiSelectDD({
    ajax: {
        url: '/api/products',
        search: true  // Enable server-side search
    },
    search: true
});
```

---

## .NET Integration Examples

### Example 1: ViewBag with Razor

**Controller:**

```csharp
public IActionResult Index()
{
    ViewBag.Countries = new List<SelectListItem>
    {
        new SelectListItem { Value = "us", Text = "United States" },
        new SelectListItem { Value = "uk", Text = "United Kingdom" },
        new SelectListItem { Value = "ca", Text = "Canada" }
    };
    return View();
}
```

**View:**

```html
<select name="countries" class="multiDD" multiple>
    @foreach(var country in ViewBag.Countries)
    {
        <option value="@country.Value">@country.Text</option>
    }
</select>
```

### Example 2: AJAX with API Controller

**JavaScript:**

```javascript
$('#categories').multiSelectDD({
    ajax: '@Url.Action("GetCategories", "Api")',
    pagination: {
        enabled: true,
        pageSize: 20
    }
});
```

**API Controller:**

```csharp
[HttpGet]
public IActionResult GetCategories(int page = 1, int pageSize = 20, string search = "")
{
    var query = _context.Categories.AsQueryable();
    
    // Apply search filter
    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(c => c.Name.Contains(search));
    }
    
    var totalCount = query.Count();
    var items = query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new { value = c.Id.ToString(), text = c.Name })
        .ToList();
    
    return Json(new
    {
        items = items,
        hasMore = (page * pageSize) < totalCount,
        totalCount = totalCount
    });
}
```

### Example 3: Form Submission

**View:**

```html
@using (Html.BeginForm("SavePreferences", "User", FormMethod.Post))
{
    <div class="form-group">
        <label>Select Skills</label>
        <select name="skills" class="multiDD" multiple>
            @foreach(var skill in Model.AvailableSkills)
            {
                <option value="@skill.Id" 
                        @(Model.SelectedSkills.Contains(skill.Id) ? "selected" : "")>
                    @skill.Name
                </option>
            }
        </select>
    </div>
    
    <button type="submit">Save</button>
}
```

**Controller:**

```csharp
[HttpPost]
public IActionResult SavePreferences(List<string> skills)
{
    // skills will contain all selected values
    // e.g., ["1", "3", "5"]
    
    return RedirectToAction("Index");
}
```

### Example 4: Dynamic Loading with Cascading

```javascript
$('#country').on('change', function() {
    var countryId = $(this).val();
    
    // Clear and reload cities
    $('#cities').multiSelectDD('destroy');
    $('#cities').empty();
    
    $('#cities').multiSelectDD({
        ajax: '/api/cities?countryId=' + countryId,
        placeholder: 'Select cities...'
    });
});
```

### Example 5: Tag Helper (Custom)

Create a custom tag helper:

```csharp
[HtmlTargetElement("multiselect-dd")]
public class MultiSelectDDTagHelper : TagHelper
{
    public string Name { get; set; }
    public string Placeholder { get; set; }
    public bool Search { get; set; } = true;
    public bool SelectAll { get; set; } = true;
    public List<SelectListItem> Items { get; set; }
    
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "select";
        output.Attributes.Add("name", Name);
        output.Attributes.Add("class", "multiDD");
        output.Attributes.Add("multiple", "multiple");
        output.Attributes.Add("data-placeholder", Placeholder);
        output.Attributes.Add("data-search", Search.ToString().ToLower());
        output.Attributes.Add("data-select-all", SelectAll.ToString().ToLower());
        
        foreach (var item in Items)
        {
            output.Content.AppendHtml($"<option value='{item.Value}'>{item.Text}</option>");
        }
    }
}
```

Usage:

```html
<multiselect-dd name="countries" 
                placeholder="Select countries" 
                items="@Model.Countries">
</multiselect-dd>
```

---

## Styling & Customization

### CSS Variables

Customize appearance using CSS variables:

```css
:root {
    --multidd-primary-color: #007bff;
    --multidd-border-radius: 8px;
    --multidd-font-size-larger: 14px;
    --multidd-input-min-height: 50px;
}
```

### Custom Theme Example

```css
/* Dark theme */
.dark-theme .multidd-header {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
}

.dark-theme .multidd-dropdown {
    background-color: #2d3748;
    color: #e2e8f0;
}

.dark-theme .multidd-option:hover {
    background-color: #4a5568;
}
```

### Override Specific Styles

```css
/* Custom width */
.multidd-container {
    max-width: 400px;
}

/* Custom header height */
.multidd-header {
    min-height: 60px;
}

/* Custom dropdown height */
.multidd-dropdown {
    max-height: 300px;
}
```

---

## Accessibility

The plugin includes built-in accessibility features:

- **ARIA Attributes**: `role`, `aria-expanded`, `aria-selected`
- **Keyboard Navigation**: Arrow keys, Enter, Space, Escape
- **Focus Management**: Proper tab order and focus indicators
- **Screen Reader Support**: Semantic HTML and labels

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus on dropdown header |
| `Enter` / `Space` | Open/close dropdown |
| `Arrow Down` | Navigate to next option |
| `Arrow Up` | Navigate to previous option |
| `Enter` / `Space` | Select/unselect focused option |
| `Escape` | Close dropdown |

### Best Practices

```html
<!-- Always include labels -->
<label for="countries">Select Countries</label>
<select id="countries" name="countries" class="multiDD" multiple>
    <option value="us">United States</option>
</select>

<!-- For required fields -->
<select name="skills" class="multiDD" multiple required>
    ...
</select>
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 11+ |
| Edge | 79+ |
| Opera | 47+ |
| IE | Not supported |

### Mobile Support

Fully responsive and touch-friendly:
- iOS Safari 11+
- Chrome for Android
- Samsung Internet

---

## Troubleshooting

### Issue: Dropdown doesn't initialize

**Solution:**
```javascript
// Make sure jQuery is loaded first
// Check if element exists
if ($('#mySelect').length) {
    $('#mySelect').multiSelectDD();
}
```

### Issue: Values not submitting with form

**Solution:**
```javascript
// The original <select> is synced automatically
// Make sure the name attribute is set
<select name="countries[]" class="multiDD" multiple>
```

### Issue: AJAX not loading

**Solution:**
```javascript
// Check browser console for errors
// Verify API endpoint returns correct format
// Check CORS settings if different domain
```

### Issue: Conflicts with existing styles

**Solution:**
```css
/* Use more specific selectors */
.my-form .multidd-container {
    /* Your overrides */
}

/* Or change CSS variable values */
:root {
    --multidd-primary-color: #your-color;
}
```

---

## Advanced Examples

### Example: Conditional Options

```javascript
$('#role').on('change', function() {
    if ($(this).val() === 'admin') {
        $('#permissions').multiSelectDD('enable');
    } else {
        $('#permissions').multiSelectDD('disable');
        $('#permissions').multiSelectDD('clear');
    }
});
```

### Example: Custom Validation

```javascript
$('#skills').multiSelectDD({
    min: 2,
    max: 5,
    onChange: function(value, text, item) {
        var count = $(this).val().length;
        if (count < 2) {
            $('.error-msg').text('Please select at least 2 skills');
        } else {
            $('.error-msg').text('');
        }
    }
});
```

### Example: Real-time Filtering

```javascript
$('#products').multiSelectDD({
    ajax: {
        url: '/api/products',
        search: true
    },
    search: true,
    onChange: function() {
        updateCart();
    }
});

function updateCart() {
    var selected = $('#products').val();
    // Update UI or send to server
}
```

---

## PlayGround

```javascript
https://xisxus.github.io/MultiSelectDD-Document/
```

## License

MIT License - Feel free to use in personal and commercial projects.

---

## Support

For issues or questions:
1. Check this documentation
2. Review code examples
3. Check browser console for errors
4. Verify jQuery version compatibility

---

## Changelog

### Version 1.0.0
- Initial release
- jQuery compatibility
- AJAX support
- Infinite scroll pagination
- Full .NET integration
- Accessibility features
- Responsive design
