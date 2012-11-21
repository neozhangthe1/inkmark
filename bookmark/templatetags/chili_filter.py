'''my custom filters
'''
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe
from django.utils.html import conditional_escape as esc
from django.template import Library
import re
register=Library()

@register.filter(name='highlight')
@stringfilter
def highlight(value,query,autoescape=None):
	'''query should be a list constructed of words which are specified to be highlighted.
	The method of highlight is just adding a <span> tag with "highlight" class, 
	which make it possible for client to use css to highlight these words.
	'''
	assert type(query) is list
	if not query:
		return autoescape and esc(value) or value
	if autoescape:
		value=esc(value)
		HL_WDS='|'.join([esc(word) for word in query])
	else:
		HL_WDS='|'.join(query)
	HL_PATTERN=re.compile(r'(?P<query>' + HL_WDS + r')',re.I)
	hl_value=HL_PATTERN.sub(r'<span class="highlight">\g<query></span>',value)
	return mark_safe(hl_value)
highlight.needs__autoescape=True

@register.filter(name='num2star')
def num2star(value):
	'''convert a number to some stars, say, if value is 3.2, return 3 stars.
	'''
	if value:
		return '★'*int(round(value))
	else:
		return '暂无评分'