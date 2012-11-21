这个包提供了两个个HTML分析器,分别是
BaseHTMLProcessor:一个基础的分析器，输入一个Html文档，再原样输出。
OKHTMLParser:上一个分析器的派生类，输入一个Html文档以及关键词，可以把关键词高亮显示，原理是设置特定文本的属性（用<span class="highlight"></span>包裹），再配合CSS改变这些文本的显示效果。
