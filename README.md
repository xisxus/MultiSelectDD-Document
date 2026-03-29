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
13. [Troubleshooting](#troubleshooting)

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
| `countOnly` | boolean | `false` | Show only count |
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
// Get selected values (standard jQuery on the <select>)
var values = $('#mySelect').val();
// Returns: ['value1', 'value2']

// Set selected values (static data)
$('#mySelect').multiSelectDD('val', ['value1', 'value2']);
```

### valDD() — Shorthand Get/Set (Recommended)

The easiest way to get or set values:
```javascript
// Get selected values
$('#mySelect').valDD()           // → ['1', '3', '5']

// Set single value
$('#mySelect').valDD(1)

// Set multiple values
$('#mySelect').valDD([1, 3, 5])
```

Works with static data, AJAX, and pagination.
Add the `valDD` code to the bottom of `multidd_js_file.js` before the closing `})(jQuery);`.


### Getting Values (Reliable Method)

The standard `.val()` through the jQuery chain has a known limitation with this plugin.
Use the instance directly for guaranteed results:

```javascript
// Most reliable — access instance directly
var instance = $('#mySelect').data('multiSelectDD');
var values = instance.getSelectedValues();  // ['1', '3', '5']
var items  = instance.getSelectedItems();   // [{ value, text, selected }, ...]
```

> After applying the val() getter fix from the JS Fixes section, this also works:
> ```javascript
> var values = $('#mySelect').multiSelectDD('val');
> ```

### Getting Values for $.serialize() / AJAX Form Submit

The plugin keeps the hidden `<select>` in sync, so `$.serialize()` picks up
selected values automatically — **as long as the `<select>` has a `name` attribute**.

```html
<!-- Required: name attribute must be present -->
<select id="skills" name="skills" class="multiDD" multiple></select>
```

```javascript
// $.serialize() — works automatically
$.ajax({
    url: '/YourController/Save',
    method: 'POST',
    data: $('form').serialize()
    // sends: skills=1&skills=3&skills=5
});

// FormData approach
var fd = new FormData($('form')[0]);
$.ajax({
    url: '/YourController/Save',
    method: 'POST',
    data: fd,
    processData: false,
    contentType: false
});
```

**Controller:**
```csharp
[HttpPost]
public IActionResult Save(List<int> skills)
{
    // skills = [1, 3, 5]
}
```

> ⚠️ If you use an AJAX data source (no static `<option>` tags in HTML), apply the
> `syncSelect()` fix from the JS Fixes section. Without it, `$.serialize()` sends
> nothing because no `<option>` tags exist in the DOM at submit time.

### Setting Predefined Values (Edit Forms)

**Static data — works immediately:**
```javascript
$('#mySelect').multiSelectDD({
    data: [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
    ]
});
$('#mySelect').multiSelectDD('val', ['1', '2']);
```

**With AJAX — data loads async, so use `onLoad` callback:**
```javascript
// Pass selected IDs from your model into JS
var preSelected = @Html.Raw(Json.Serialize(Model.SelectedIds)); // e.g. [1, 3]

$('#mySelect').multiSelectDD({
    ajax: '/api/items',
    onLoad: function() {
        $('#mySelect').multiSelectDD('val', preSelected.map(String));
    }
});
```

> After applying the `_pendingValues` fix from the JS Fixes section, you can
> call `val()` immediately without the `onLoad` callback:
> ```javascript
> $('#mySelect').multiSelectDD({ ajax: '/api/items' });
> $('#mySelect').multiSelectDD('val', preSelected.map(String));
> ```

### Setting Predefined Values with Pagination (Edit Forms)

With pagination enabled, only the first page is loaded initially.
If a preselected value is on page 2+, you must pass it via `onLoad`
**and** ensure your API returns those items on page 1, OR pass `selected: true`
from the server response.

**Recommended — mark selected items in the API response:**
```csharp
// In your API controller, mark items as selected based on saved data
var savedIds = GetSavedIdsForUser(userId); // e.g. [5, 12]

var items = query
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .Select(c => new {
        value = c.Id.ToString(),
        text  = c.Name,
        selected = savedIds.Contains(c.Id)  // <-- mark selected here
    })
    .ToList();
```

The plugin reads `selected: true` from each item in the AJAX response and
pre-checks them as pages load.

**Alternative — force selected items to appear on page 1:**
```csharp
[HttpGet]
public IActionResult GetItems(int page = 1, int pageSize = 20,
                              string search = "", string selectedIds = "")
{
    var ids = selectedIds.Split(',').Where(x => !string.IsNullOrEmpty(x))
                         .Select(int.Parse).ToList();

    var query = _context.Items.AsQueryable();
    if (!string.IsNullOrEmpty(search))
        query = query.Where(i => i.Name.Contains(search));

    // Always include selected items on page 1
    List<Item> items;
    if (page == 1 && ids.Any())
    {
        var selected = query.Where(i => ids.Contains(i.Id)).ToList();
        var rest = query.Where(i => !ids.Contains(i.Id))
                        .Take(pageSize - selected.Count).ToList();
        items = selected.Concat(rest).ToList();
    }
    else
    {
        items = query.Where(i => !ids.Contains(i.Id))
                     .Skip((page - 1) * pageSize)
                     .Take(pageSize).ToList();
    }

    return Json(new {
        items    = items.Select(i => new { value = i.Id.ToString(), text = i.Name }),
        hasMore  = query.Count() > page * pageSize,
    });
}
```

**JavaScript — pass selected IDs to the AJAX request:**
```javascript
var preSelected = @Html.Raw(Json.Serialize(Model.SelectedIds));

$('#mySelect').multiSelectDD({
    ajax: {
        url: '/api/items',
        data: { selectedIds: preSelected.join(',') }
    },
    pagination: {
        enabled: true,
        pageSize: 20
    }
});
```


### Example: AJAX Pagination with Preselected Values (Edit Form)

**The problem:** With pagination, selected employees may be on page 2+
and won't appear checked unless handled server-side.

**Solution:** Pull selected employees to page 1, exclude them from subsequent pages.

**JavaScript — reusable init function:**
```javascript
function initSecurityEmployees(selectedIds) {
    if (selectedIds !== undefined && selectedIds !== null) {
        if (!Array.isArray(selectedIds)) selectedIds = [selectedIds];
    }

    $('#SecurityEmployeeId').multiSelectDD('destroy');
    $('#SecurityEmployeeId').multiSelectDD({
        selectAll: false,
        countOnly: true,
        ajax: {
            url: '/SecurityTeams/SearchEmployeesAD',
            data: selectedIds && selectedIds.length ? { selectedIds: selectedIds.join(',') } : {}
        },
        pagination: { enabled: true, pageSize: 50, scrollThreshold: 0.8 }
    });
}

// On page load
initSecurityEmployees();

// On edit
initSecurityEmployees(data.securityEmployeeIds);
```

**Controller:**
```csharp
public async Task<IActionResult> SearchEmployeesAD(string search, int page = 1,
                                                    int pageSize = 50, string selectedIds = "")
{
    var ids = string.IsNullOrEmpty(selectedIds) ? new List<int>()
              : selectedIds.Split(',').Select(int.Parse).ToList();

    var data = await commonService.SearchMultiEmployees(search, page, pageSize, ids);
    return Json(data);
}
```

**Service:**
```csharp
public async Task<MultiResult<MultiSelectVM>> SearchMultiEmployees(string search,
                                                int page = 1, int pageSize = 50,
                                                List<int> selectedIds = null)
{
    selectedIds ??= new List<int>();
    var query = _employees.AllActive().AsNoTracking();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var pattern = $"%{search}%";
        query = query.Where(e =>
                      EF.Functions.Like(e.FirstName + " " + e.LastName, pattern) ||
                      EF.Functions.Like(e.MobileNumber, pattern) ||
                      EF.Functions.Like(e.Email, pattern));
    }

    var totalCount = await query.CountAsync();
    List<MultiSelectVM> items;

    if (page == 1 && selectedIds.Any())
    {
        var selected = await query
            .Where(x => selectedIds.Contains(x.EmployeeID))
            .Select(x => new MultiSelectVM { Value = x.EmployeeID, Text = x.DisplayName, Selected = true })
            .ToListAsync();

        var rest = await query
            .Where(x => !selectedIds.Contains(x.EmployeeID))
            .OrderBy(x => x.EmployeeID)
            .Take(pageSize - selected.Count)
            .Select(x => new MultiSelectVM { Value = x.EmployeeID, Text = x.DisplayName, Selected = false })
            .ToListAsync();

        items = selected.Concat(rest).ToList();
    }
    else
    {
        items = await query
            .Where(x => !selectedIds.Contains(x.EmployeeID))
            .OrderBy(x => x.EmployeeID)
            .Skip(page == 1 ? 0 : (((page - 1) * pageSize) - selectedIds.Count))
            .Take(pageSize)
            .Select(x => new MultiSelectVM { Value = x.EmployeeID, Text = x.DisplayName, Selected = false })
            .ToListAsync();
    }

    return new MultiResult<MultiSelectVM> { Items = items, HasMore = (page * pageSize) < totalCount, TotalCount = totalCount };
}
```

**ViewModel:**
```csharp

public class MultiResult<T>
{
    public List<T> Items { get; set; }
    public bool HasMore { get; set; }
    public int TotalCount { get; set; }
}

public class MultiSelectVM
{
    public int Value { get; set; }
    public string Text { get; set; }
    public bool Selected { get; set; }
}
```

> Make sure your JSON serializer uses camelCase so the plugin receives
> `value`, `text`, `selected` (lowercase).


### Enable/Disable

```javascript
$('#mySelect').multiSelectDD('disable');
$('#mySelect').multiSelectDD('enable');
```

### Clear Selection

```javascript
$('#mySelect').multiSelectDD('clear');
```

### Select All

```javascript
$('#mySelect').multiSelectDD('selectAll');
```

### Add/Remove Options

```javascript
// Add option
$('#mySelect').multiSelectDD('addOption', 'value4', 'Option 4', false);

// Remove option
$('#mySelect').multiSelectDD('removeOption', 'value4');

// Add via jQuery then refresh
$('#mySelect').append('<option value="value4">Option 4</option>');
$('#mySelect').multiSelectDD('refresh');
```

### Refresh / Reload

```javascript
// Refresh from <select> tags
$('#mySelect').multiSelectDD('refresh');

// Reload AJAX data from scratch
$('#mySelect').multiSelectDD('reload');
```

### Destroy

```javascript
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
    onLoad: function(data) {
        console.log('Data loaded:', data.length, 'items');
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

### 3. AJAX URL (simple)

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
        data: { categoryId: 5 }
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

Or simplified array:

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

### Server-Side Parameters Sent Automatically

| Parameter | Description |
|-----------|-------------|
| `page` | Current page number (starts at 1) |
| `pageSize` | Items per page |
| `search` | Search term (if search is enabled) |

### Server-Side Search

```javascript
$('#products').multiSelectDD({
    ajax: {
        url: '/api/products',
        search: true
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

    if (!string.IsNullOrEmpty(search))
        query = query.Where(c => c.Name.Contains(search));

    var totalCount = query.Count();
    var items = query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new { value = c.Id.ToString(), text = c.Name })
        .ToList();

    return Json(new
    {
        items      = items,
        hasMore    = (page * pageSize) < totalCount,
        totalCount = totalCount
    });
}
```

### Example 3: Form Submission (Regular POST)

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
    // skills = ["1", "3", "5"]
    return RedirectToAction("Index");
}
```

### Example 4: AJAX Form Submit with $.serialize()

```javascript
$('form').on('submit', function(e) {
    e.preventDefault();

    $.ajax({
        url: '/YourController/Save',
        method: 'POST',
        data: $(this).serialize(),
        success: function(response) {
            console.log('Saved');
        }
    });
});
```

> The plugin syncs selected values back to the hidden `<select>` on every change,
> so `$.serialize()` picks them up with no extra steps needed.
>
> ⚠️ If you use AJAX data (no static `<option>` tags), apply the `syncSelect()` fix
> so options exist in the DOM at submit time.

### Example 5: AJAX Form Submit with FormData

```javascript
$('form').on('submit', function(e) {
    e.preventDefault();

    var fd = new FormData(this);

    $.ajax({
        url: '/YourController/Save',
        method: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log('Saved');
        }
    });
});
```

### Example 6: Edit Form with Predefined Values (Static Data)

**Controller:**
```csharp
public IActionResult Edit(int id)
{
    var model = new EditViewModel
    {
        AvailableSkills = _context.Skills
            .Select(s => new SelectListItem { Value = s.Id.ToString(), Text = s.Name })
            .ToList(),
        SelectedSkillIds = _context.UserSkills
            .Where(us => us.UserId == id)
            .Select(us => us.SkillId.ToString())
            .ToList()
    };
    return View(model);
}
```

**View:**
```html
<select name="skills" class="multiDD" multiple>
    @foreach(var skill in Model.AvailableSkills)
    {
        <option value="@skill.Value"
                @(Model.SelectedSkillIds.Contains(skill.Value) ? "selected" : "")>
            @skill.Text
        </option>
    }
</select>
```

The plugin reads `selected` from `<option>` tags automatically on init.

### Example 7: Edit Form with Predefined Values (AJAX Data)

```javascript
// Pass saved IDs from model into JS
var preSelected = @Html.Raw(Json.Serialize(Model.SelectedSkillIds)); // ["1","3"]

$('#skills').multiSelectDD({
    ajax: '/api/skills',
    onLoad: function() {
        $('#skills').multiSelectDD('val', preSelected);
    }
});
```

### Example 8: Edit Form with Predefined Values + Pagination

When pagination is enabled, mark selected items in your API response so they
are highlighted as each page loads:

```csharp
[HttpGet]
public IActionResult GetSkills(int page = 1, int pageSize = 20,
                               string search = "", string selectedIds = "")
{
    var ids = string.IsNullOrEmpty(selectedIds)
        ? new List<int>()
        : selectedIds.Split(',').Select(int.Parse).ToList();

    var query = _context.Skills.AsQueryable();
    if (!string.IsNullOrEmpty(search))
        query = query.Where(s => s.Name.Contains(search));

    var totalCount = query.Count();

    // On page 1, always bring selected items to the top
    List<Skill> items;
    if (page == 1 && ids.Any())
    {
        var selected = query.Where(s => ids.Contains(s.Id)).ToList();
        var rest = query.Where(s => !ids.Contains(s.Id))
                        .Take(pageSize - selected.Count).ToList();
        items = selected.Concat(rest).ToList();
    }
    else
    {
        items = query.Where(s => !ids.Contains(s.Id))
                     .Skip((page - 1) * pageSize)
                     .Take(pageSize).ToList();
    }

    return Json(new {
        items = items.Select(s => new {
            value    = s.Id.ToString(),
            text     = s.Name,
            selected = ids.Contains(s.Id)   // plugin reads this
        }),
        hasMore = (page * pageSize) < totalCount
    });
}
```

**JavaScript:**
```javascript
var preSelected = @Html.Raw(Json.Serialize(Model.SelectedSkillIds));

$('#skills').multiSelectDD({
    ajax: {
        url: '/api/skills',
        data: { selectedIds: preSelected.join(',') }
    },
    pagination: {
        enabled: true,
        pageSize: 20
    }
});
```

### Example 9: Dynamic Loading with Cascading Dropdowns

```javascript
$('#country').on('change', function() {
    var countryId = $(this).val();

    $('#cities').multiSelectDD('destroy');
    $('#cities').empty();

    $('#cities').multiSelectDD({
        ajax: '/api/cities?countryId=' + countryId,
        placeholder: 'Select cities...'
    });
});
```

### Example 10: Tag Helper (Custom)

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

        foreach (var item in Items)
        {
            output.Content.AppendHtml(
                $"<option value='{item.Value}'{(item.Selected ? " selected" : "")}>{item.Text}</option>"
            );
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

```css
:root {
    --multidd-primary-color: #007bff;
    --multidd-border-radius: 8px;
    --multidd-font-size-larger: 14px;
    --multidd-input-min-height: 50px;
    --multidd-options-height: 40dvh;
}
```

### Dark Theme Example

```css
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
.multidd-container { max-width: 400px; }
.multidd-header    { min-height: 60px; }
.multidd-dropdown  { max-height: 300px; }
```

---

## Accessibility

- ARIA attributes: `role`, `aria-expanded`, `aria-selected`
- Keyboard navigation: Arrow keys, Enter, Space, Escape
- Focus management with visible focus indicators
- Screen reader compatible

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus dropdown header |
| `Enter` / `Space` | Open/close dropdown |
| `Arrow Down` | Open dropdown / next option |
| `Escape` | Close dropdown |

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

Mobile: iOS Safari 11+, Chrome for Android, Samsung Internet.

---

## Troubleshooting

### Values not submitting with form POST

- Make sure `name` attribute is set on the `<select>`
- If using AJAX data source, apply the `syncSelect()` fix so `<option>` tags exist in DOM

### val() returns undefined

Use the instance directly:
```javascript
var values = $('#mySelect').data('multiSelectDD').getSelectedValues();
```
Or apply the val() getter fix from the JS Fixes section.

### Predefined values not showing on edit form with AJAX

Use `onLoad` callback or apply the `_pendingValues` fix:
```javascript
$('#mySelect').multiSelectDD({
    ajax: '/api/items',
    onLoad: function() {
        $('#mySelect').multiSelectDD('val', preSelected);
    }
});
```

### Predefined values not showing with pagination

Mark `selected: true` on matching items in your API response, and pass selected IDs
as a parameter so page 1 always includes them (see Example 8).

### AJAX not loading

- Check browser console for errors
- Verify the API returns `{ items: [...], hasMore: bool }` or a plain array
- Check CORS settings if on a different domain

### Dropdown doesn't initialize

```javascript
if ($('#mySelect').length) {
    $('#mySelect').multiSelectDD();
}
```

### Conflicts with existing styles

```css
.my-form .multidd-container { /* scoped overrides */ }
```

---

## JS Fixes Reference

These are targeted changes needed in `multidd_js_file.js` to fix known issues
in ASP.NET Core MVC usage. See the issues and exact line locations below.

### Fix 1 — val() getter ($.fn.multiSelectDD, line ~757)

Add before `return this.each(...)`:
```javascript
if (typeof options === 'string' && args.length === 0 &&
    ['val', 'getSelectedValues', 'getSelectedItems'].includes(options)) {
    const instance = $(this.get(0)).data('multiSelectDD');
    return instance ? instance[options]() : [];
}
```

### Fix 2 — syncSelect() for AJAX + form submit (line ~519)

Add before `this.$select.find('option').prop('selected', false)`:
```javascript
this.allData.forEach(item => {
    if (!this.$select.find(`option[value="${item.value}"]`).length) {
        this.$select.append($('<option>', { value: item.value, text: item.text }));
    }
});
```

### Fix 3 — val() setter: type mismatch + AJAX timing (line ~581)

```javascript
const xisxusNewValues = values.map(String); // convert to strings

if (this.options.ajax && this.allData.length === 0) {
    this._pendingValues = xisxusNewValues;   // store for after AJAX loads
    return;
}

item.selected = xisxusNewValues.includes(String(item.value)); // string compare
```

### Fix 4 — loadAjaxData() success: apply pending values (line ~705)

In the `if (self.currentPage === 1)` block, change `selected: item.selected || false` to:
```javascript
const pendingValues = self._pendingValues || [];
// ...
selected: item.selected || pendingValues.includes(String(item.value)),
// after the map():
self._pendingValues = null;
```

---

## Playground

https://xisxus.github.io/MultiSelectDD-Document/

---

## License

MIT License — free to use in personal and commercial projects.

---

## Changelog

### Version 1.0.0
- Initial release
- jQuery compatibility
- AJAX support with server-side search
- Infinite scroll pagination
- Full .NET / ASP.NET Core MVC integration
- Accessibility features
- Responsive design