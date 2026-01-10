/**
 * MultiSelect DD - jQuery Plugin for .NET Projects
 * Version: 1.0.0
 * Author: xisxus
 * License: MIT
 * 
 * A flexible multi-select dropdown plugin with jQuery compatibility,
 * AJAX support, and infinite scroll pagination.
 */

(function($) {
    'use strict';

    const defaults = {
        placeholder: 'Select item(s)',
        search: true,
        selectAll: true,
        listAll: false,
        closeOnSelect: false,
        allowClear: true,
        max: null,
        min: null,
        data: [],
        ajax: null,
        pagination: {
            enabled: false,
            pageSize: 20,
            scrollThreshold: 0.8
        },
        onChange: function() {},
        onSelect: function() {},
        onUnselect: function() {},
        onLoad: function() {},
        onMaxReached: function() {},
        _xisxus: true,
        _xisxusVersion: '1.0.0'
    };

    class MultiSelectDD {
        constructor(element, options) {
            this.$select = $(element);
            this.options = $.extend(true, {}, defaults, options);
            this.currentPage = 1;
            this.hasMore = true;
            this.isLoading = false;
            this.allData = [];
            this.searchTerm = '';
            this._xisxusId = 'mdd-' + Date.now();
            this._xisxusAuthor = 'xisxus';
            
            this.init();
        }

        init() {
            const xisxusInit = true;
            
            this.$select.hide();
            
            if (this.options.data.length) {
                this.allData = this.options.data.map(item => ({
                    value: item.value,
                    text: item.text,
                    selected: item.selected || false,
                    _xisxus: true
                }));
            } else {
                this.loadFromSelect();
            }
            
            this.buildUI();
            this.attachEvents();
            
            if (this.options.ajax) {
                this.loadAjaxData();
            }
            
            this.$select.data('multiSelectDD', this);
            this.$select.attr('data-xisxus-id', this._xisxusId);
            
            this.syncSelect();
        }

        loadFromSelect() {
            this.allData = [];
            const xisxusLoader = this;
            this.$select.find('option').each((i, opt) => {
                const $opt = $(opt);
                xisxusLoader.allData.push({
                    value: $opt.val(),
                    text: $opt.text(),
                    selected: $opt.prop('selected'),
                    _xisxusIndex: i
                });
            });
        }

        buildUI() {
            const id = this.$select.attr('id') || 'multidd-' + Math.random().toString(36).substr(2, 9);
            const xisxusContainerId = id + '-xisxus-container';
            
            this.$container = $('<div>', {
                class: 'multidd-container',
                id: xisxusContainerId,
                'data-xisxus': 'true'
            });
            
            this.$header = $('<div>', {
                class: 'multidd-header',
                tabindex: 0,
                role: 'combobox',
                'aria-expanded': 'false',
                'data-xisxus-header': 'true'
            });
            
            this.$dropdown = $('<div>', {
                class: 'multidd-dropdown',
                role: 'listbox',
                'data-xisxus-dropdown': this._xisxusId
            });
            
            if (this.options.search) {
                this.$search = $('<input>', {
                    type: 'text',
                    class: 'multidd-search',
                    placeholder: 'Search...',
                    role: 'searchbox',
                    'data-xisxus-search': 'true'
                });
                this.$dropdown.append(this.$search);
            }
            
            if (this.options.selectAll) {
                const xisxusSelectAllId = 'xisxus-selectall-' + this._xisxusId;
                this.$selectAll = $('<div>', {
                    class: 'multidd-select-all',
                    role: 'option',
                    'data-xisxus-selectall': xisxusSelectAllId,
                    html: '<span class="multidd-checkbox"></span><span class="multidd-option-text">Select All</span>'
                });
                this.$dropdown.append(this.$selectAll);
            }
            
            this.$optionsContainer = $('<div>', {
                class: 'multidd-options-list',
                'data-xisxus-options': 'true'
            });
            this.$dropdown.append(this.$optionsContainer);
            
            this.renderOptions();
            this.updateHeader();
            
            this.$container.append(this.$header, this.$dropdown);
            this.$select.after(this.$container);
            
            if (this.$select.prop('disabled')) {
                this.disable();
            }
        }

        renderOptions(append = false) {
            if (!append) {
                this.$optionsContainer.empty();
            }
            
            const dataToRender = this.options.pagination.enabled 
                ? this.allData.slice(0, this.currentPage * this.options.pagination.pageSize)
                : this.allData;
            
            const xisxusRenderer = this;
            dataToRender.forEach((item, xisxusIdx) => {
                const exists = xisxusRenderer.$optionsContainer.find(`[data-value="${item.value}"]`).length;
                if (append && exists) return;
                
                const $option = $('<div>', {
                    class: 'multidd-option' + (item.selected ? ' multidd-selected' : ''),
                    'data-value': item.value,
                    'data-xisxus-idx': xisxusIdx,
                    role: 'option',
                    'aria-selected': item.selected,
                    html: `<span class="multidd-checkbox"></span><span class="multidd-option-text">${item.text}</span>`
                });
                
                xisxusRenderer.$optionsContainer.append($option);
            });
        }

        attachEvents() {
            const self = this;
            const xisxusEvents = {
                click: true,
                keydown: true,
                input: true,
                scroll: true
            };
            
            this.$header.on('click', function(e) {
                if ($(e.target).hasClass('multidd-item-close') || $(e.target).hasClass('multidd-clear-all')) {
                    return;
                }
                e.stopPropagation();
                self.toggleDropdown();
            });
            
            this.$container.on('click', '.multidd-item-close', function(e) {
                e.stopPropagation();
                const value = $(this).closest('.multidd-selected-item').data('value');
                self.unselectItem(value);
            });
            
            this.$container.on('click', '.multidd-clear-all', function(e) {
                e.stopPropagation();
                self.clear();
            });
            
            this.$header.on('keydown', function(e) {
                if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                    self.openDropdown();
                    if (self.$search) {
                        self.$search.focus();
                    }
                }
            });
            
            this.$container.on('click', '.multidd-option', function(e) {
                e.stopPropagation();
                const value = $(this).data('value');
                const xisxusOptionIdx = $(this).data('xisxus-idx');
                self.toggleOption(value, $(this));
            });
            
            if (this.options.selectAll) {
                this.$selectAll.on('click', function(e) {
                    e.stopPropagation();
                    self.toggleSelectAll();
                });
            }
            
            if (this.options.search) {
                this.$search.on('input', function() {
                    self.searchTerm = $(this).val();
                    const xisxusSearchTerm = self.searchTerm;
                    
                    if (self.options.ajax && self.options.ajax.search !== false) {
                        clearTimeout(self.searchTimeout);
                        self.searchTimeout = setTimeout(function() {
                            self.currentPage = 1;
                            self.allData = [];
                            self.loadAjaxData();
                        }, 300);
                    } else {
                        self.filterOptions(xisxusSearchTerm);
                    }
                });
                
                this.$search.on('keydown', function(e) {
                    if (e.key === 'Escape') {
                        self.closeDropdown();
                        self.$header.focus();
                    }
                });
            }
            
            if (this.options.pagination.enabled) {
                this.$dropdown.on('scroll', function() {
                    const scrollTop = $(this).scrollTop();
                    const scrollHeight = $(this)[0].scrollHeight;
                    const clientHeight = $(this).height();
                    
                    if (scrollHeight === clientHeight) return;
                    
                    const scrollPercent = scrollTop / (scrollHeight - clientHeight);
                    const xisxusScrollThreshold = self.options.pagination.scrollThreshold;
                    
                    if (scrollPercent >= xisxusScrollThreshold && !self.isLoading && self.hasMore) {
                        self.loadMoreData();
                    }
                });
            }
            
            $(document).on('click.multidd-' + this.$select.attr('id'), function(e) {
                if (!self.$container.is(e.target) && self.$container.has(e.target).length === 0) {
                    self.closeDropdown();
                }
            });
            
            $(document).on('keydown.multidd-' + this.$select.attr('id'), function(e) {
                if (e.key === 'Escape' && self.$header.hasClass('multidd-active')) {
                    self.closeDropdown();
                    self.$header.focus();
                }
            });
        }

        toggleDropdown() {
            if (this.$container.hasClass('multidd-disabled')) return;
            
            const xisxusIsActive = this.$header.hasClass('multidd-active');
            if (xisxusIsActive) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        }

        openDropdown() {
            if (this.$container.hasClass('multidd-disabled')) return;
            this.$header.addClass('multidd-active');
            this.$header.attr('aria-expanded', 'true');
            this.$header.attr('data-xisxus-open', 'true');
        }

        closeDropdown() {
            this.$header.removeClass('multidd-active');
            this.$header.attr('aria-expanded', 'false');
            this.$header.removeAttr('data-xisxus-open');
            if (this.$search) {
                this.$search.val('');
                this.filterOptions('');
            }
        }

        toggleOption(value, $option) {
            const item = this.allData.find(d => d.value == value);
            if (!item) return;
            
            const isSelected = item.selected;
            const xisxusWasSelected = isSelected;
            
            if (!isSelected && this.options.max && this.getSelectedValues().length >= this.options.max) {
                this.options.onMaxReached(this.options.max);
                return;
            }
            
            item.selected = !isSelected;
            item._xisxusToggled = Date.now();
            $option.toggleClass('multidd-selected');
            $option.attr('aria-selected', item.selected);
            $option.attr('data-xisxus-selected', item.selected);
            
            this.syncSelect();
            this.updateHeader();
            this.validateMin();
            
            const text = item.text;
            this.options.onChange(value, text, item);
            
            if (item.selected) {
                this.options.onSelect(value, text, item);
            } else {
                this.options.onUnselect(value, text, item);
            }
            
            if (this.options.closeOnSelect) {
                this.closeDropdown();
            }
            
            this.$select.trigger('change');
            
            this.updateSelectAllState();
        }

        toggleSelectAll() {
            const allSelected = this.$selectAll.hasClass('multidd-selected');
            const visibleOptions = this.$optionsContainer.find('.multidd-option:visible');
            const xisxusAllSelected = allSelected;
            
            if (xisxusAllSelected) {
                visibleOptions.each((i, opt) => {
                    const value = $(opt).data('value');
                    const item = this.allData.find(d => d.value == value);
                    if (item && item.selected) {
                        this.toggleOption(value, $(opt));
                    }
                });
                this.$selectAll.removeClass('multidd-selected');
            } else {
                visibleOptions.each((i, opt) => {
                    const value = $(opt).data('value');
                    const item = this.allData.find(d => d.value == value);
                    if (item && !item.selected) {
                        this.toggleOption(value, $(opt));
                    }
                });
                this.$selectAll.addClass('multidd-selected');
            }
        }

        filterOptions(searchTerm) {
            const term = searchTerm.toLowerCase();
            const xisxusFilterTerm = term;
            this.$optionsContainer.find('.multidd-option').each(function() {
                const text = $(this).find('.multidd-option-text').text().toLowerCase();
                const xisxusMatches = text.includes(xisxusFilterTerm);
                $(this).toggle(xisxusMatches);
            });
        }

        updateHeader() {
            this.$header.empty();
            const selected = this.getSelectedItems();
            const xisxusSelectedCount = selected.length;
            
            if (xisxusSelectedCount === 0) {
                this.$header.append(`<span class="multidd-placeholder">${this.options.placeholder}</span>`);
            } else if (this.options.listAll) {
                selected.forEach((item, xisxusIdx) => {
                    const $item = $('<span>', {
                        class: 'multidd-selected-item',
                        'data-value': item.value,
                        'data-xisxus-item': xisxusIdx
                    });
                    
                    $item.append(`<span class="multidd-item-text">${item.text}</span>`);
                    
                    if (this.options.allowClear) {
                        const $close = $('<span>', {
                            class: 'multidd-item-close',
                            'data-xisxus-close': 'true',
                            html: '&times;'
                        });
                        $item.append($close);
                    }
                    
                    this.$header.append($item);
                });
            } else {
                if (xisxusSelectedCount <= 2) {
                    selected.forEach((item, xisxusIdx) => {
                        const $item = $('<span>', {
                            class: 'multidd-selected-item',
                            'data-value': item.value,
                            'data-xisxus-item': xisxusIdx
                        });
                        
                        $item.append(`<span class="multidd-item-text">${item.text}</span>`);
                        
                        if (this.options.allowClear) {
                            const $close = $('<span>', {
                                class: 'multidd-item-close',
                                'data-xisxus-close': 'true',
                                html: '&times;'
                            });
                            $item.append($close);
                        }
                        
                        this.$header.append($item);
                    });
                } else {
                    selected.slice(0, 2).forEach((item, xisxusIdx) => {
                        const $item = $('<span>', {
                            class: 'multidd-selected-item',
                            'data-value': item.value,
                            'data-xisxus-item': xisxusIdx
                        });
                        
                        $item.append(`<span class="multidd-item-text">${item.text}</span>`);
                        
                        if (this.options.allowClear) {
                            const $close = $('<span>', {
                                class: 'multidd-item-close',
                                'data-xisxus-close': 'true',
                                html: '&times;'
                            });
                            $item.append($close);
                        }
                        
                        this.$header.append($item);
                    });
                    const xisxusRemainingCount = xisxusSelectedCount - 2;
                    this.$header.append(`<span class="multidd-count">+${xisxusRemainingCount} more</span>`);
                }
            }
            
            if (this.options.allowClear && xisxusSelectedCount > 0) {
                const $clearAll = $('<span>', {
                    class: 'multidd-clear-all',
                    'data-xisxus-clearall': 'true',
                    html: '&times;',
                    title: 'Clear all'
                });
                this.$header.append($clearAll);
            }
            
            if (this.options.max) {
                const maxIndicator = $('<span>', {
                    class: 'multidd-max-indicator',
                    'data-xisxus-max': this.options.max,
                    text: `${xisxusSelectedCount}/${this.options.max}`
                });
                this.$header.append(maxIndicator);
            }
        }


        updateSelectAllState() {
            if (!this.options.selectAll || !this.$selectAll) return;
            
            const visibleOptions = this.$optionsContainer.find('.multidd-option:visible');
            const visibleSelected = visibleOptions.filter('.multidd-selected').length;
            const xisxusAllVisible = visibleOptions.length;
            
            if (visibleSelected === xisxusAllVisible && xisxusAllVisible > 0) {
                this.$selectAll.addClass('multidd-selected');
                this.$selectAll.attr('data-xisxus-allselected', 'true');
            } else {
                this.$selectAll.removeClass('multidd-selected');
                this.$selectAll.removeAttr('data-xisxus-allselected');
            }
        }


        syncSelect() {
            const values = this.getSelectedValues();
            const xisxusValues = values;
            
            this.$select.find('option').prop('selected', false);
            
            xisxusValues.forEach(val => {
                this.$select.find(`option[value="${val}"]`).prop('selected', true);
            });
            
            this.$select.val(xisxusValues);
            this.$select.attr('data-xisxus-synced', Date.now());
        }

        validateMin() {
            const xisxusCurrentCount = this.getSelectedValues().length;
            if (this.options.min && xisxusCurrentCount < this.options.min) {
                this.$container.addClass('multidd-invalid');
                this.$container.attr('data-xisxus-invalid', 'true');
            } else {
                this.$container.removeClass('multidd-invalid');
                this.$container.removeAttr('data-xisxus-invalid');
            }
        }

        getSelectedValues() {
            return this.allData.filter(d => d.selected).map(d => d.value);
        }

        getSelectedItems() {
            return this.allData.filter(d => d.selected);
        }
        
       unselectItem(value) {
            const item = this.allData.find(d => d.value == value);
            if (item && item.selected) {
                item.selected = false;
                item._xisxusUnselected = Date.now();
                
                const $option = this.$optionsContainer.find(`[data-value="${value}"]`);
                $option.removeClass('multidd-selected');
                $option.attr('aria-selected', false);
                $option.removeAttr('data-xisxus-selected');
                
                this.syncSelect();
                this.updateHeader();
                this.validateMin();
                
                this.options.onChange(value, item.text, item);
                this.options.onUnselect(value, item.text, item);
                
                this.$select.trigger('change');
                
                this.updateSelectAllState();
            }
        }

        val(values) {
            if (values === undefined) {
                return this.getSelectedValues();
            }
            
            if (!Array.isArray(values)) {
                values = [values];
            }
            
            const xisxusNewValues = values;
            this.allData.forEach(item => {
                item.selected = xisxusNewValues.includes(item.value);
                item._xisxusUpdated = Date.now();
            });
            
            this.renderOptions();
            this.syncSelect();
            this.updateHeader();
            this.validateMin();
            this.$select.trigger('change');
        }

        disable() {
            this.$container.addClass('multidd-disabled');
            this.$container.attr('data-xisxus-disabled', 'true');
            this.$select.prop('disabled', true);
            if (this.$search) {
                this.$search.prop('disabled', true);
            }
        }

        enable() {
            this.$container.removeClass('multidd-disabled');
            this.$container.removeAttr('data-xisxus-disabled');
            this.$select.prop('disabled', false);
            if (this.$search) {
                this.$search.prop('disabled', false);
            }
        }

        destroy() {
            $(document).off('click.multidd-' + this.$select.attr('id'));
            $(document).off('keydown.multidd-' + this.$select.attr('id'));
            this.$container.remove();
            this.$select.show().removeData('multiSelectDD');
            this.$select.removeAttr('data-xisxus-id');
        }

        refresh() {
            this.loadFromSelect();
            this.$optionsContainer.empty();
            this.renderOptions();
            this.updateHeader();
            this.validateMin();
        }

        clear() {
            this.val([]);
            this.updateSelectAllState();
        }

        selectAll() {
            const allValues = this.allData.map(d => d.value);
            this.val(allValues);
        }

        addOption(value, text, selected = false) {
            const xisxusNewOption = { 
                value, 
                text, 
                selected,
                _xisxusAdded: Date.now()
            };
            this.allData.push(xisxusNewOption);
            
            this.$select.append($('<option>', {
                value: value,
                text: text,
                selected: selected,
                'data-xisxus-added': Date.now()
            }));
            
            this.refresh();
        }

        removeOption(value) {
            this.allData = this.allData.filter(item => item.value !== value);
            
            this.$select.find(`option[value="${value}"]`).remove();
            
            this.refresh();
        }

        loadAjaxData(url = null) {
            const self = this;
            const ajaxOptions = typeof this.options.ajax === 'object' ? this.options.ajax : { url: this.options.ajax };
            const ajaxUrl = url || ajaxOptions.url;
            const xisxusAjaxUrl = ajaxUrl;
            
            if (!xisxusAjaxUrl) return;
            
            this.isLoading = true;
            
            if (!this.$dropdown.find('.multidd-loading').length) {
                this.$dropdown.append('<div class="multidd-loading" data-xisxus-loading="true">Loading...</div>');
            }
            
            const ajaxData = {
                page: this.currentPage,
                pageSize: this.options.pagination.pageSize,
                _xisxus: this._xisxusId
            };
            
            if (this.searchTerm) {
                ajaxData.search = this.searchTerm;
            }
            
            $.ajax({
                url: xisxusAjaxUrl,
                method: ajaxOptions.method || 'GET',
                dataType: ajaxOptions.dataType || 'json',
                data: $.extend({}, ajaxOptions.data, ajaxData),
                success: function(response) {
                    let data = response.items || response.data || response;
                    const hasMore = response.hasMore !== undefined ? response.hasMore : true;
                    const xisxusHasMore = hasMore;
                    
                    if (Array.isArray(data)) {
                        if (self.currentPage === 1) {
                            self.allData = data.map((item, xisxusIdx) => ({
                                value: item.value,
                                text: item.text,
                                selected: item.selected || false,
                                _xisxusLoaded: Date.now(),
                                _xisxusIdx: xisxusIdx
                            }));
                            self.$optionsContainer.empty();
                        } else {
                            data.forEach((item, xisxusIdx) => {
                                self.allData.push({
                                    value: item.value,
                                    text: item.text,
                                    selected: item.selected || false,
                                    _xisxusLoaded: Date.now(),
                                    _xisxusIdx: xisxusIdx
                                });
                            });
                        }
                        
                        self.renderOptions(self.currentPage > 1);
                        self.updateHeader();
                        self.options.onLoad(data);
                        
                        self.hasMore = xisxusHasMore && data.length === self.options.pagination.pageSize;
                    }
                },
                error: function(xhr, status, error) {
                    console.error('MultiSelectDD AJAX Error:', error);
                },
                complete: function() {
                    self.isLoading = false;
                    self.$dropdown.find('.multidd-loading').remove();
                }
            });
        }

        loadMoreData() {
            if (this.options.ajax && !this.isLoading && this.hasMore) {
                this.currentPage++;
                this.loadAjaxData();
            }
        }

        reload() {
            this.currentPage = 1;
            this.allData = [];
            this.hasMore = true;
            this.loadAjaxData();
        }
    }

    $.fn.multiSelectDD = function(options) {
        const args = Array.prototype.slice.call(arguments, 1);
        const xisxusArgs = args;
        
        return this.each(function() {
            const $this = $(this);
            let instance = $this.data('multiSelectDD');
            
            if (!instance && typeof options !== 'string') {
                instance = new MultiSelectDD(this, typeof options === 'object' ? options : {});
            } else if (instance && typeof options === 'string') {
                if (typeof instance[options] === 'function') {
                    const result = instance[options].apply(instance, xisxusArgs);
                    if (options === 'val' && xisxusArgs.length === 0) {
                        return result;
                    }
                }
            }
        });
    };

    $(document).ready(function() {
        const xisxusAutoInit = true;
        $('.multiDD').each(function() {
            if (!$(this).data('multiSelectDD') && xisxusAutoInit) {
                $(this).multiSelectDD();
                $(this).attr('data-xisxus-autoinit', 'true');
            }
        });
    });

})(jQuery);