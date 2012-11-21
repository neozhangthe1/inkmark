'''another parser to highlight the words in query, 
it's just ok except that the charref and entityref are beyond its ability
'''
import re
from cgi import escape
from BaseHTMLProcessor import BaseHTMLProcessor

class hlParser(BaseHTMLProcessor):
	'''the queryHightlightParser
	'''
	def __init__(self,query,verbose=0):
		#verbatim except modifying the reset method
		self.verbose=verbose
		self.reset(query)
	def reset(self,query):
		#query is the list of keywords,eg:['yu','aoi']
		query=[escape(word) for word in query]
		words='|'.join(query)
		self.Q_PATTERN=re.compile(r'(?P<query>' + words + r')',re.I)
		self.highlight=0
		BaseHTMLProcessor.reset(self)
	def start_a(self,attrs):
		tagClass=dict(attrs).get('class','')
		#only if the class-attribute of tag contains 'title',text will be processed
		if tagClass.find('title')!=-1:
			self.highlight+=1
		self.unknown_starttag('a', attrs)
	def end_a(self):
		self.unknown_endtag('a')
		if self.highlight>0:
			self.highlight-=1

	def handle_data(self,text):
		self.pieces.append(self.highlight and self.process(text) or text)
		
	def process(self,text):
		text=self.Q_PATTERN.sub(r'<span class="highlight">\g<query></span>',text)
		return text