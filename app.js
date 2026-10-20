;(function(){
 window.__PB_REWRITTEN=false;
 try{
  if(document.getElementById("freshcan"))return;
  const B64="PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCB2aWV3cG9ydC1maXQ9Y292ZXIiPgo8bWV0YSBuYW1lPSJhcHBsZS1tb2JpbGUtd2ViLWFwcC1jYXBhYmxlIiBjb250ZW50PSJ5ZXMiPgo8bWV0YSBuYW1lPSJ0aGVtZS1jb2xvciIgY29udGVudD0iIzBmMTExNSI+CjxsaW5rIHJlbD0iaWNvbiIgaHJlZj0iZGF0YTosIj4KPHRpdGxlPnBpIGJyaWRnZTwvdGl0bGU+CjxzdHlsZT4KOnJvb3R7CiAtLWJnOiMwZjExMTU7IC0tcGFuZWw6IzE3MWEyMTsgLS1wYW5lbDI6IzFjMjAyNzsgLS1saW5lOiMyNjJiMzU7CiAtLWZnOiNlNmU5ZWY7IC0tZGltOiM4YjkzYTE7IC0tYWNjOiM2ZWE4ZmU7IC0tZ29vZDojM2ZiOTUwOyAtLXdhcm46I2QyOTkyMjsgLS1lcnI6I2Y4NTE0OTsgLS10aDojODk1N2M5OyAtLXRvb2w6IzNkOGJiNTsKfQoqe2JveC1zaXppbmc6Ym9yZGVyLWJveH0KaHRtbCxib2R5e21hcmdpbjowO3BhZGRpbmc6MDtoZWlnaHQ6MTAwZHZoO2JhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLWZnKTsKIGZvbnQ6MTZweC8xLjQ1IC1hcHBsZS1zeXN0ZW0sc3lzdGVtLXVpLFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmfQojYXBwe2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47aGVpZ2h0OjEwMGR2aDttYXgtd2lkdGg6ODYwcHg7bWFyZ2luOjAgYXV0b30KI3RvcGJhcntkaXNwbGF5OmZsZXg7Z2FwOjhweDthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo4cHggMTBweDtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTsKIGJvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpO2ZsZXgtd3JhcDp3cmFwO3Jvdy1nYXA6NnB4fQojdG9wYmFyIC5idG5ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2ZsZXgtd3JhcDp3cmFwO2p1c3RpZnktY29udGVudDpmbGV4LWVuZDttYXgtd2lkdGg6NjAlO3Jvdy1nYXA6NnB4fQojdG9wYmFyIC5kb3R7d2lkdGg6OXB4O2hlaWdodDo5cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS1kaW0pO2ZsZXg6bm9uZX0KI3RvcGJhciAuZG90Lm9ue2JhY2tncm91bmQ6dmFyKC0tZ29vZCl9CiN0b3BiYXIgLmRvdC5ydW57YmFja2dyb3VuZDp2YXIoLS1hY2MpO2FuaW1hdGlvbjpwdWxzZSAxcyBpbmZpbml0ZX0KQGtleWZyYW1lcyBwdWxzZXs1MCV7b3BhY2l0eTouMzV9fQojbW9kZWx7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZGltKTtmbGV4OjEgMSA0MHB4O21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcH0KI3Nlc3N7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZGltKTttYXgtd2lkdGg6MzR2dztmbGV4OjAgMSBhdXRvO21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcH0KYnV0dG9ue2ZvbnQ6aW5oZXJpdDtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsMik7Y29sb3I6dmFyKC0tZmcpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7CiBib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjVweCAxMHB4O2N1cnNvcjpwb2ludGVyO3RvdWNoLWFjdGlvbjptYW5pcHVsYXRpb247bWluLXdpZHRoOjB9CmJ1dHRvbjphY3RpdmV7b3BhY2l0eTouNn0KYnV0dG9uLmRhbmdlcntib3JkZXItY29sb3I6IzVjMmIyYjtjb2xvcjp2YXIoLS1lcnIpfQpidXR0b246ZGlzYWJsZWR7b3BhY2l0eTouNDtjdXJzb3I6ZGVmYXVsdH0KI2NoYXR7ZmxleDoxO292ZXJmbG93LXk6YXV0bztvdmVyc2Nyb2xsLWJlaGF2aW9yOmNvbnRhaW47cGFkZGluZzoxMHB4Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofQoubXNne21hcmdpbjowIDAgMTBweDtkaXNwbGF5OmZsZXg7bWluLXdpZHRoOjB9Ci5tc2cgLmJvZHl7bWF4LXdpZHRoOjg1JTtwYWRkaW5nOjhweCAxMnB4O2JvcmRlci1yYWRpdXM6MTRweDtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTsKIGJvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7b3ZlcmZsb3ctd3JhcDpicmVhay13b3JkO3dvcmQtYnJlYWs6YnJlYWstd29yZH0KLm1zZy5tZXRhIC5ib2R5e21heC13aWR0aDoxMDAlO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRpbSk7Zm9udC1zaXplOjEycHh9Ci5tc2cudXNlcntqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmR9Ci5tc2cudXNlciAuYm9keXtiYWNrZ3JvdW5kOiMxZTJiNDU7Ym9yZGVyLWNvbG9yOiMyYjNkNjE7Ym9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6NHB4fQoubXNnLmFzc2lzdGFudCAuYm9keXtib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzOjRweH0KLm1zZyAud2hve2ZvbnQtc2l6ZToxMHB4O2xldHRlci1zcGFjaW5nOi41cHg7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2NvbG9yOnZhcigtLWRpbSk7bWFyZ2luLWJvdHRvbTozcHh9Ci5tZHt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtmb250LXNpemU6MTVweH0KLm1kIHByZXtiYWNrZ3JvdW5kOiMxMTE0MWE7cGFkZGluZzo4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjhweDsKIG92ZXJmbG93LXg6YXV0bztmb250LXNpemU6MTJweDttYXJnaW46NHB4IDB9Ci5tZCBwcmUgY29kZSwubWQgLm1vbm97Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLE1lbmxvLG1vbm9zcGFjZX0KLnRoaW5re21hcmdpbjo2cHggMDtmb250LXNpemU6MTJweDtib3JkZXItbGVmdDozcHggc29saWQgdmFyKC0tdGgpO3BhZGRpbmc6MnB4IDhweDsKIGNvbG9yOiNiOWExZGQ7YmFja2dyb3VuZDojMTcxMjFkO2JvcmRlci1yYWRpdXM6MCA4cHggOHB4IDB9Ci50aGluayAuaHtjb2xvcjp2YXIoLS10aCk7Zm9udC13ZWlnaHQ6NjAwO2N1cnNvcjpwb2ludGVyO3VzZXItc2VsZWN0Om5vbmV9Ci50aGluayAudHh0e3doaXRlLXNwYWNlOnByZS13cmFwO2NvbG9yOiNhOTliYzQ7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLE1lbmxvLG1vbm9zcGFjZTtkaXNwbGF5Om5vbmV9Ci50aGluay5vcGVuIC50eHR7ZGlzcGxheTpibG9ja30KLnRvb2x7bWFyZ2luOjZweCAwO2ZvbnQtc2l6ZToxMnB4O2JvcmRlci1sZWZ0OjNweCBzb2xpZCB2YXIoLS10b29sKTtwYWRkaW5nOjRweCA4cHg7CiBiYWNrZ3JvdW5kOiMxMTFhMjI7Y29sb3I6IzlmYzRkYztib3JkZXItcmFkaXVzOjAgOHB4IDhweCAwfQoudG9vbCAuaHtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tdG9vbCk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLE1lbmxvLG1vbm9zcGFjZX0KLnRvb2wgLmEsLnRvb2wgLnJ7d2hpdGUtc3BhY2U6cHJlLXdyYXA7Zm9udC1mYW1pbHk6dWktbW9ub3NwYWNlLE1lbmxvLG1vbm9zcGFjZTtmb250LXNpemU6MTFweDsKIGNvbG9yOiM3ZDk1YTg7ZGlzcGxheTpub25lO21hcmdpbi10b3A6MnB4fQoudG9vbC5vcGVuIC5hLC50b29sLm9wZW4gLnJ7ZGlzcGxheTpibG9ja30KLnRvb2wgLmF7bWF4LWhlaWdodDoxMjBweDtvdmVyZmxvdzphdXRvfQoudG9vbCAucnttYXgtaGVpZ2h0OjIwMHB4O292ZXJmbG93OmF1dG99Ci50b29sIC5yLmVycntjb2xvcjp2YXIoLS1lcnIpfQojY29tcG9zZXJ7ZGlzcGxheTpmbGV4O2dhcDo4cHg7cGFkZGluZzo4cHggOHB4IG1heCg4cHgsZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pKTtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1saW5lKTtmbGV4Om5vbmU7YWxpZ24taXRlbXM6ZmxleC1lbmR9CiNpbnB1dHtmbGV4OjE7cmVzaXplOm5vbmU7bWF4LWhlaWdodDoxNDBweDtiYWNrZ3JvdW5kOnZhcigtLWJnKTtjb2xvcjp2YXIoLS1mZyk7CiBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjlweCAxMnB4O2ZvbnQ6aW5oZXJpdH0KI2lucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tYWNjKX0KI3NlbmR7YWxpZ24tc2VsZjpmbGV4LWVuZH0KI3RvYXN0e3Bvc2l0aW9uOmZpeGVkO2xlZnQ6NTAlO2JvdHRvbTo5MHB4O3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpO2JhY2tncm91bmQ6IzAwMGQ7CiBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO3BhZGRpbmc6NnB4IDE0cHg7Ym9yZGVyLXJhZGl1czoyMHB4O2ZvbnQtc2l6ZToxM3B4Owogb3BhY2l0eTowO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbjpvcGFjaXR5IC4yczttYXgtd2lkdGg6ODB2dzt6LWluZGV4Ojh9CiN0b2FzdC5zaG93e29wYWNpdHk6MX0KI3RhYnN7ZGlzcGxheTpmbGV4O2JhY2tncm91bmQ6dmFyKC0tcGFuZWwpO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2ZsZXg6bm9uZTtwYWRkaW5nLWJvdHRvbTptYXgoMHB4LGVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tKSl9CiN0YWJzIGJ1dHRvbntmbGV4OjE7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czowO2JvcmRlci1ib3R0b206MnB4IHNvbGlkIHRyYW5zcGFyZW50O3BhZGRpbmc6OHB4IDZweDtmb250LXNpemU6MTNweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3doaXRlLXNwYWNlOm5vd3JhcH0KI3RhYnMgYnV0dG9uLmFjdHtib3JkZXItYm90dG9tLWNvbG9yOnZhcigtLWFjYyk7Y29sb3I6dmFyKC0tYWNjKTtmb250LXdlaWdodDo2MDB9CiN2aWV3c3twb3NpdGlvbjpyZWxhdGl2ZTtvdmVyZmxvdzpoaWRkZW47ZmxleDoxIDEgMCU7bWluLWhlaWdodDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59Ci52aWV3e3Bvc2l0aW9uOmFic29sdXRlO2luc2V0OjA7b3ZlcmZsb3c6aGlkZGVuO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59Ci52aWV3W2hpZGRlbl17ZGlzcGxheTpub25lfQoubm90aWZ7bWFyZ2luOjEwcHggMTBweCAwO3BhZGRpbmc6OHB4IDEycHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHZhcigtLXdhcm4pO2JhY2tncm91bmQ6IzIyMWMxMDtib3JkZXItcmFkaXVzOjAgMTBweCAxMHB4IDA7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjE0cHh9Ci5ub3RpZiAudHtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0td2Fybil9Ci5ub3RpZiAueHtjb2xvcjp2YXIoLS1kaW0pO2ZvbnQtc2l6ZToxMnB4O21hcmdpbi10b3A6MnB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9Ci5taXJyb3J7bWFyZ2luOjhweCAxMHB4O2JhY2tncm91bmQ6dmFyKC0tcGFuZWwpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTBweH0KLm1pcnJvciAuaHtkaXNwbGF5OmZsZXg7Z2FwOjhweDthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXA7Zm9udC1zaXplOjEzcHh9Ci5taXJyb3IgLmggLnNwe2ZsZXg6MX0KLm1pcnJvciAucm93e3BhZGRpbmc6NnB4IDA7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZSk7Zm9udC1zaXplOjEzcHg7ZGlzcGxheTpmbGV4O2dhcDo4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX0KLm1pcnJvciAucm93IC5ye2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRpbSk7bWluLXdpZHRoOjI2cHg7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2ZvbnQtd2VpZ2h0OjcwMDtwYWRkaW5nLXRvcDoycHh9Ci5taXJyb3IgLnJvdy55b3UgLnJ7Y29sb3I6dmFyKC0tYWNjKX0KLm1pcnJvciAucm93LnBpIC5ye2NvbG9yOnZhcigtLWdvb2QpfQouc2xpc3R7ZmxleDoxO292ZXJmbG93LXk6YXV0bztvdmVyc2Nyb2xsLWJlaGF2aW9yOmNvbnRhaW47cGFkZGluZzoxMHB4Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofQouc3Byb2p7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZGltKTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7bGV0dGVyLXNwYWNpbmc6LjVweDttYXJnaW46MTRweCA0cHggNnB4O292ZXJmbG93LXdyYXA6YW55d2hlcmV9Ci5zaXRlbXtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjlweCAxMXB4O21hcmdpbi1ib3R0b206OHB4O2N1cnNvcjpwb2ludGVyfQouc2l0ZW0gLnR0e2ZvbnQtc2l6ZToxNHB4O2Rpc3BsYXk6LXdlYmtpdC1ib3g7LXdlYmtpdC1saW5lLWNsYW1wOjI7LXdlYmtpdC1ib3gtb3JpZW50OnZlcnRpY2FsO292ZXJmbG93OmhpZGRlbn0KLnNpdGVtIC5tdHtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kaW0pO21hcmdpbi10b3A6M3B4O2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcH0KLnNpdGVtLmxpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWdvb2QpfQouc2l0ZW0ubGl2ZSAubXQgYntjb2xvcjp2YXIoLS1nb29kKX0KLnNmb290e2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjttYXJnaW4tdG9wOjhweH0KLmZidG57ZmxleDoxO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtwYWRkaW5nOjZweCAxMHB4O2JvcmRlci1yYWRpdXM6OXB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7YmFja2dyb3VuZDp2YXIoLS1wYW5lbDIpO2NvbG9yOnZhcigtLWZnKTtjdXJzb3I6cG9pbnRlcjt0b3VjaC1hY3Rpb246bWFuaXB1bGF0aW9ufQouZmJ0bjphY3RpdmV7b3BhY2l0eTouN30KLmZidG5bZGlzYWJsZWRde29wYWNpdHk6LjV9Ci5mYnRuLmdob3N0e2ZsZXg6MCAwIGF1dG87Ym9yZGVyLXN0eWxlOmRhc2hlZDtjb2xvcjp2YXIoLS1kaW0pfQouZmJ0bi5kYW5nZXJie2JvcmRlci1jb2xvcjojNWMyYjJiO2NvbG9yOnZhcigtLWVycik7Ym9yZGVyLXN0eWxlOnNvbGlkfQoubXZpZXd3cmFwe2ZsZXg6MTtvdmVyZmxvdy15OmF1dG87b3ZlcnNjcm9sbC1iZWhhdmlvcjpjb250YWluO3BhZGRpbmc6NDZweCAxMHB4IDEwcHg7LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2h9Ci5tdi1iYWNre3Bvc2l0aW9uOmFic29sdXRlO3RvcDo4cHg7bGVmdDo4cHg7ei1pbmRleDozO3BhZGRpbmc6NHB4IDEwcHh9Ci5tdi10aXRsZXtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kaW0pO3BhZGRpbmc6NnB4IDJweCA4cHg7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtsaW5lLWhlaWdodDoxLjU7ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydH0KLm12LXRpdGxlIC50dHtmbGV4OjF9CiNtdmdvYnRue2ZsZXg6MCAwIGF1dG87Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1jb2xvcjojMmI0YjJmO2JhY2tncm91bmQ6IzE0MjkxYTtjb2xvcjp2YXIoLS1nb29kKTtib3JkZXItcmFkaXVzOjlweDtwYWRkaW5nOjVweCAxMHB4O3RvdWNoLWFjdGlvbjptYW5pcHVsYXRpb259CiNiYWRnZXtiYWNrZ3JvdW5kOnZhcigtLWVycik7Y29sb3I6I2ZmZjtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MTBweDtwYWRkaW5nOjAgNXB4O2ZvbnQtd2VpZ2h0OjcwMDttYXJnaW4tbGVmdDo0cHh9CiNiYWRnZVtoaWRkZW5de2Rpc3BsYXk6bm9uZX0KI2F1dGh7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtiYWNrZ3JvdW5kOnZhcigtLWJnKTt6LWluZGV4Ojk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjsKIGp1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzoyMHB4fQojYXV0aFtoaWRkZW5de2Rpc3BsYXk6bm9uZX0KI2F1dGggLmNhcmR7YmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjE2cHg7CiBwYWRkaW5nOjI0cHg7bWF4LXdpZHRoOjM0MHB4O3dpZHRoOjEwMCU7dGV4dC1hbGlnbjpjZW50ZXJ9CiNhdXRoIGlucHV0e3dpZHRoOjEwMCU7bWFyZ2luOjEycHggMDtwYWRkaW5nOjEwcHg7YmFja2dyb3VuZDp2YXIoLS1iZyk7Y29sb3I6dmFyKC0tZmcpOwogYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjEwcHg7Zm9udDppbmhlcml0fQo6Oi13ZWJraXQtc2Nyb2xsYmFye3dpZHRoOjZweH0KOjotd2Via2l0LXNjcm9sbGJhci10aHVtYntiYWNrZ3JvdW5kOnZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6M3B4fQo8L3N0eWxlPgo8L2hlYWQ+Cjxib2R5Pgo8ZGl2IGlkPSJhcHAiPgo8ZGl2IGlkPSJ0b3BiYXIiPgo8c3BhbiBpZD0ic3RhdHVzZG90IiBjbGFzcz0iZG90Ij48L3NwYW4+CjxzcGFuIGlkPSJtb2RlbCI+Y29ubmVjdGluZ+KApjwvc3Bhbj4KPHNwYW4gaWQ9InNlc3MiPjwvc3Bhbj4KPHNwYW4gY2xhc3M9ImJ0bnMiPgo8YnV0dG9uIGlkPSJsdmxidG4iIHRpdGxlPSJ0aGlua2luZyBsZXZlbCI+PzwvYnV0dG9uPgo8YnV0dG9uIGlkPSJuZXdidG4iPm5ldzwvYnV0dG9uPgo8YnV0dG9uIGlkPSJhYmJ0biIgY2xhc3M9ImRhbmdlciI+c3RvcDwvYnV0dG9uPgo8YnV0dG9uIGlkPSJwdXNoYnRuIiB0aXRsZT0iZ2V0IHdlYi1wdXNoIG5vdGlmaWNhdGlvbnMgb24gdGhpcyBkZXZpY2UuXG4ocmVsaWFibGUgZmFsbGJhY2s6IGFueSBudGZ5IGFwcCAvIHB1c2hidWxsZXQgLyBjdXJsIHN1YnNjcmliZWQgdG8gdGhpcyBzZXJ2ZXIncyBwaWJyaWRnZSB0b3BpYzogaHR0cDovLzEwMC4xMjEuMjYuNzk6MzMzMy8iKT7wn5SUPC9idXR0b24+Cjwvc3Bhbj4KPC9kaXY+CjxkaXYgaWQ9InZpZXdzIj4KPGRpdiBpZD0idi1jaGF0IiBjbGFzcz0idmlldyI+CjxkaXYgaWQ9Im5vdGlmcyI+PC9kaXY+CjxkaXYgaWQ9ImNoYXQiPjwvZGl2Pgo8Zm9ybSBpZD0iY29tcG9zZXIiPgo8dGV4dGFyZWEgaWQ9ImlucHV0IiByb3dzPSIxIiBwbGFjZWhvbGRlcj0ibWVzc2FnZeKApiAoY3RybC9zaGlmdCtlbnRlciBzZW5kcyBtdWx0aWxpbmUpIj48L3RleHRhcmVhPgo8YnV0dG9uIGlkPSJzZW5kIj5zZW5kPC9idXR0b24+CjwvZm9ybT4KPC9kaXY+CjxkaXYgaWQ9InYtc2VzcyIgY2xhc3M9InZpZXciIGhpZGRlbj4KPGRpdiBpZD0ic2xpc3QiIGNsYXNzPSJzbGlzdCI+PC9kaXY+CjwvZGl2Pgo8ZGl2IGlkPSJ2LW12aWV3IiBjbGFzcz0idmlldyIgaGlkZGVuPgo8YnV0dG9uIGlkPSJtdmJhY2siIGNsYXNzPSJtdi1iYWNrIj7ihpAgc2Vzc2lvbnM8L2J1dHRvbj4KPGRpdiBjbGFzcz0ibXYtdGl0bGUiIGlkPSJtdnRpdGxlIj48c3BhbiBjbGFzcz0idHQiPjwvc3Bhbj48YnV0dG9uIGlkPSJtdmdvYnRuIiB0eXBlPSJidXR0b24iPuKGqSByZXBseSBoZXJlPC9idXR0b24+PC9kaXY+CjxkaXYgaWQ9Im1jaGF0IiBjbGFzcz0ibXZpZXd3cmFwIj48L2Rpdj4KPC9kaXY+CjwvZGl2Pgo8ZGl2IGlkPSJ0YWJzIj4KPGJ1dHRvbiBpZD0idGFiLWNoYXQiIGNsYXNzPSJhY3QiPvCfkqwgY2hhdDwvYnV0dG9uPgo8YnV0dG9uIGlkPSJ0YWItc2VzcyI+8J+XgiBzZXNzaW9ucyA8c3BhbiBpZD0iYmFkZ2UiIGhpZGRlbj4xPC9zcGFuPjwvYnV0dG9uPgo8L2Rpdj4KPC9kaXY+CjxkaXYgaWQ9InRvYXN0Ij48L2Rpdj4KPGRpdiBpZD0iYXV0aCIgaGlkZGVuPjxkaXYgY2xhc3M9ImNhcmQiPjxoMyBzdHlsZT0ibWFyZ2luOjAgMCA2cHgiPnBpIGJyaWRnZTwvaDM+PHAgc3R5bGU9ImNvbG9yOnZhcigtLWRpbSk7Zm9udC1zaXplOjEzcHgiPkVudGVyIHRva2VuIChvbiB0aGUgbWFjaGluZTogfi8uY29uZmlnL3BpYnJpZGdlL3Rva2VuKTo8L3A+PGlucHV0IGlkPSJ0b2tlbiIgdHlwZT0icGFzc3dvcmQiIGF1dG9jb21wbGV0ZT0ib2ZmIiBwbGFjZWhvbGRlcj0idG9rZW4iPjxidXR0b24gaWQ9InRva2VuZ28iIHN0eWxlPSJ3aWR0aDoxMDAlIj5jb25uZWN0PC9idXR0b24+PHAgc3R5bGU9ImNvbG9yOnZhcigtLWVycik7Zm9udC1zaXplOjEycHg7bWFyZ2luLXRvcDo4cHgiIGlkPSJhdXRoZXJyIj48L3A+PC9kaXY+PC9kaXY+CjxzY3JpcHQgaWQ9ImJvb3QiPndpbmRvdy5fX0JPT1RfVDA9RGF0ZS5ub3coKTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigidW5oYW5kbGVkcmVqZWN0aW9uIixmdW5jdGlvbihldil7dHJ5e2ZldGNoKCIvYXBpL2RpYWciLHttZXRob2Q6IlBPU1QiLGhlYWRlcnM6eyJjb250ZW50LXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn0sYm9keTpKU09OLnN0cmluZ2lmeSh7dWE6bmF2aWdhdG9yLnVzZXJBZ2VudCxwcm9iZToidW5oYW5kbGVkcmVqZWN0aW9uIixtc2c6U3RyaW5nKGV2JiZldi5yZWFzb24pLnNsaWNlKDAsMjAwKX0pfSl9Y2F0Y2goZSl7fX0pO2ZldGNoKCIvYXBwLmJ1bmRsZS5qcy5zaGEyNTYiKS50aGVuKHI9PnIudGV4dCgpKS50aGVuKHh2PT57dmFyIHM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7cy5zcmM9Ii9hcHAuYnVuZGxlLmpzP2g9Iit4di50cmltKCk7cy5vbmVycm9yPWZ1bmN0aW9uKCl7dHJ5e2ZldGNoKCIvYXBpL2RpYWciLHttZXRob2Q6IlBPU1QiLGhlYWRlcnM6eyJjb250ZW50LXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn0sYm9keTpKU09OLnN0cmluZ2lmeSh7dWE6bmF2aWdhdG9yLnVzZXJBZ2VudCxwcm9iZToiYnVuZGxlX2xvYWRfZmFpbCIsaHJlZjpsb2NhdGlvbi5ocmVmLHNyOnNjcmVlbi53aWR0aCsieCIrc2NyZWVuLmhlaWdodCxib290TXM6RGF0ZS5ub3coKS13aW5kb3cuX19CT09UX1QwfSl9KX1jYXRjaChlKXt9fTt3aW5kb3cuQlVORExFPXh2LnRyaW0oKTtkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpfSkuY2F0Y2goZnVuY3Rpb24oZSl7dHJ5e2ZldGNoKCIvYXBpL2RpYWciLHttZXRob2Q6IlBPU1QiLGhlYWRlcnM6eyJjb250ZW50LXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn0sYm9keTpKU09OLnN0cmluZ2lmeSh7dWE6bmF2aWdhdG9yLnVzZXJBZ2VudCxwcm9iZToiaGFzaF9mZXRjaF9mYWlsIixtc2c6U3RyaW5nKGUpLnNsaWNlKDAsMjAwKSxocmVmOmxvY2F0aW9uLmhyZWYsc3I6c2NyZWVuLndpZHRoKyJ4IitzY3JlZW4uaGVpZ2h0LGJvb3RNczpEYXRlLm5vdygpLXdpbmRvdy5fX0JPT1RfVDB9KX0pfWNhdGNoKF8pe319KTwvc2NyaXB0Pgo8ZGl2IGlkPSJmcmVzaGNhbiIgaGlkZGVuPjwvZGl2Pgo8L2JvZHk+CjwvaHRtbD4K"
   /* decode + rewrite if this document is stale (no #freshcan anchor) */
   try{ var _d=atob(B64),_b=new Uint8Array(_d.length); for(var _k=0;_k<_d.length;_k++)_b[_k]=_d.charCodeAt(_k); document.open(); document.write(new TextDecoder("utf-8").decode(_b)); document.close(); window.__PB_REWRITTEN=true; }
   catch(_e){ window.__PB_REWRITTEN=false; }
  }catch(r){ try{window.__pbErr=r}catch(_){}}
})();

const BUILD="C97";
function toastMsg(m,ms=3000){toast.textContent=m;toast.classList.add("show");clearTimeout(toastMsg.t);toastMsg.t=setTimeout(()=>toast.classList.remove("show"),ms)}
const $=s=>document.querySelector(s);
let TOKEN=new URLSearchParams(location.search).get("token")||"",cursor=0,running=false,level=null,connected=false;
let viewFile=null;   // session currently shown in the file viewer (mview)
let pendingResume=null, freshAgentFlag=false; // set when user taps "reply here"; cleared after chat refresh
const chat=$("#chat"),input=$("#input"),toast=$("#toast"),modelEl=$("#model"),dot=$("#statusdot"),sessEl=$("#sess");
const levelBtn=$("#lvlbtn"),newBtn=$("#newbtn"),abBtn=$("#abbtn"),tokGo=$("#tokengo"),auth=$("#auth"),authErr=$("#autherr");
const LEVELS=["off","minimal","low","medium","high"];
// fetch wrapper with a hard CLIENT-side timeout. Phones drop / idle out long-poll TCP connections
// silently (battery savers, carrier NAT, backgrounded tabs). An awaited fetch that never resolves
// freezes the poll loop for the whole session — that was exactly why replies only showed up after a
// manual refresh. The server already heartbeats every 15s and caps a poll at 45s, so a 60s upper
// bound client-side is generous; if fetch ever hangs past it, we abort and the loop recovers.
const api=async(p,o,timeoutMs)=>{
 const base=p+(p.includes("?")?"&":"?")+"token="+encodeURIComponent(TOKEN);
 const t=timeoutMs==null?(p.includes("/api/poll")?60000:25000):timeoutMs;
 let to=null,ctl=null;
 if(typeof AbortController!=="undefined"){try{ctl=new AbortController();to=setTimeout(()=>{try{ctl.abort()}catch(e){}},t)}catch(e){}}
 let r;
 try{
  if(ctl&&o)r=await fetch(base,Object.assign({},o,{signal:ctl.signal}));
  else if(ctl)r=await fetch(base,{signal:ctl.signal});
  else r=await fetch(base,o||undefined);
 }catch(e){
  if(to)clearTimeout(to);
  if(e&&e.name==="AbortError"){const he=new Error("network timeout (fetch aborted client-side)");he.__netchk=true;throw he;}
  throw e;
 }
 if(to)clearTimeout(to);
 if(r.status===403){showAuth();return null}
 const ct=r.headers.get("content-type")||"";return ct.includes("json")?r.json():r.text();
};
function showAuth(){auth.hidden=false;authErr.textContent=""}
// make a dead connection VISIBLE and self-healing instead of a frozen "connecting…".
// (Phones lose TCP silently — battery savers, Wi-Fi sleep, PC suspend — and before this an
//  initial fetchState failure was swallowed by try/catch, leaving the top bar stuck forever.)
let connRetry=0, connTimer=null;
function setConnFail(err){ if(connected)return;
 dot.className="dot";
 const msg="⚠ "+(err&&err.message?err.message:"server unreachable");
 modelEl.textContent=msg;
 if(!connTimer){ connTimer=setInterval(()=>{connRetry++; modelEl.textContent=msg+(connRetry?"  · retry "+connRetry:""); fetchState()},10000); }
}
function setConn(ok,msg){connected=ok;dot.className="dot "+(running?"run":(ok?"on":""));if(msg)modelEl.textContent=msg;if(ok&&connTimer){clearInterval(connTimer);connTimer=null;connRetry=0}}
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function addMsg(where,role,who){
 const w=el("div","body");const md=el("div","md");const lbl=el("div","who",who||(role==="user"?"you":"pi"));w.appendChild(lbl);w.appendChild(md);
 const row=el("div","msg "+role);row.appendChild(w);(where||chat).appendChild(row);return{row,body:w,md}}
function addSys(text){
 const row=el("div","msg meta");const b=el("div","body");const sp=el("span",null,text);b.appendChild(sp);row.appendChild(b);
 chat.appendChild(row);chat.scrollTop=chat.scrollHeight}
function scrollBottom(){chat.scrollTop=chat.scrollHeight}
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function mdLite(src){
 const blocks=[];
 let t=src.replace(/```(\w*)\n?([\s\S]*?)```/g,(m,_,c)=>{blocks.push('<pre><code class="mono">'+esc(c.replace(/\n$/,""))+"</code></pre>");return"\x00B"+(blocks.length-1)+"\x00"});
 t=esc(t).replace(/`([^`\n]+)`/g,"<code class=\"mono\">$1</code>")
  .replace(/\*\*([^*\n]+)\*\*/g,"<strong>$1</strong>")
  .replace(/\*([^*\n]+)\*(?!\w)/g,"<em>$1</em>");
 return t.replace(/\x00B(\d+)\x00/g,(m,i)=>+i<blocks.length?blocks[+i]:m);
}
function setMd(p,src){p.innerHTML=mdLite(src)}
let curText=null,curThink=null,curTool=null;
function msgContent(cont){
 const t=[];
 for(const b of cont||[]){
  if(b.type==="text")t.push(b.text||"");
  else if(b.type==="thinking")t.push("[thinking: "+(b.thinking||"")+"]");
 }
 return t.join("\n");
}
function streamMsg(ev){
 const am=ev.assistantMessageEvent;
 if(ev.type==="message_end"){
  const m=ev.message;
  if(m&&m.role==="assistant"&&curText){setMd(curText.md,msgContent(m.content));curText=null;curThink=null}
  return;
 }
 if(ev.type!=="message_update"||!am)return;
 const t=am.type;
 if(t==="text_start"){const m2=addMsg();curText={txt:"",md:m2.md};curThink=null}
 else if(t==="text_delta"){
  if(!curText){const m2=addMsg();curText={txt:"",md:m2.md}}
  curText.txt+=am.delta;setMd(curText.md,curText.txt);scrollBottom();
 }else if(t==="text_end"&&curText){curText.txt=am.content||curText.txt;setMd(curText.md,curText.txt)}
}
const toolMap={};
function newToolBox(id,name,info,where){
 const box=el("div","tool");
 const h=el("div","h",(info||"")+" » "+(name||"?"));
 const a=el("div","a");const r=el("div","r");
 h.onclick=()=>box.classList.toggle("open");
 box.appendChild(h);box.appendChild(a);box.appendChild(r);
 const row=el("div","msg assistant");row.appendChild(box);(where||chat).appendChild(row);
 const rec={box,a,r};toolMap[id]=rec;return rec;
}
function resText(v){
 if(v==null)return "";
 if(typeof v==="string")return v;
 if(Array.isArray(v))return v.map(x=>resText(x)).join("\n");
 if(typeof v==="object"){if(Array.isArray(v.content))return v.content.map(c=>c.type==="text"?(c.text||""):"").join("");return JSON.stringify(v)}
 return String(v);
}
function argSummary(args){
 try{const a=args||{};
  if(a.command)return String(a.command).replace(/\s+/g," ").slice(0,70);
  if(a.path)return String(a.path).slice(0,70);
  const k=Object.keys(a)[0];if(k)return k;
  return "";}catch{return ""}
}
function headFor(box){return box.querySelector(".h")}
function streamTool(ev){
 const id=ev.toolCallId;if(!id)return;
 if(ev.type==="tool_execution_start"){
  const rec=newToolBox(id,ev.toolName,ev.toolName+": "+argSummary(ev.args));
  if(rec.a)rec.a.textContent=JSON.stringify(ev.args||{}).replace(/\s+/g," ").slice(0,300);
 }else if(ev.type==="tool_execution_end"){
  const rec=toolMap[id];if(!rec)return;
  let txt=resText(ev.result),err=!!ev.isError;
  if(txt.length>12000)txt=txt.slice(0,12000)+"\n…[truncated]";
  rec.r.textContent=err||!txt?"(no output)":txt;
  if(err)rec.r.classList.add("err");
  headFor(rec.box).textContent=headFor(rec.box).textContent.split(" » ")[0]+" » "+(ev.isError?"⚠ ":"✓ ")+(ev.durationMs!=null?(ev.durationMs/1000).toFixed(1)+"s":"");
 }
}
function thinkBlock(text){
 const box=el("div","think");const h=el("div","h","thinking");const t=el("div","txt",text);
 h.onclick=()=>box.classList.toggle("open");box.appendChild(h);box.appendChild(t);return box;
}
function renderMsg(m,where){
 const role=m.role;
 const wmap=where||chat;
 if(role==="user"){
  const md=addMsg(wmap,"user").md;
  const c=m.content;const s=typeof c==="string"?c:(c||[]).map(x=>x.text||"").join("");
  setMd(md,s);return;
 }
 if(role==="toolResult"){
  const rec=toolMap[m.toolCallId];
  if(!rec)return;
  let t=resText(m.content).slice(0,12000);
  rec.r.textContent=(m.isError?"⚠ ":"")+t;
  if(m.isError)rec.r.classList.add("err");
  headFor(rec.box).textContent=headFor(rec.box).textContent.split(" » ")[0]+" » "+(m.isError?"⚠":"✓ ");
  return;
 }
 if(role!=="assistant")return;
 const w=addMsg(wmap,"assistant");
 const texts=[];
 for(const b of m.content||[]){
  if(b.type==="text")texts.push(b.text||"");
  else if(b.type==="thinking")w.body.appendChild(thinkBlock(b.thinking||""));
  else if(b.type==="toolCall"){
   const rec=newToolBox(b.id,b.name,b.name+": "+argSummary(b.arguments),wmap);
   rec.a.textContent=JSON.stringify(b.arguments||{}).replace(/\s+/g," ").slice(0,300);
   w.body.appendChild(rec.box);
   if(wmap!==chat)wmap.scrollTop=wmap.scrollHeight;
  }
 }
 if(texts.length)setMd(w.md,texts.join("\n"));
 if(wmap===chat)chat.scrollTop=chat.scrollHeight;
}
// ---------------- live event routing ----------------
function applyPubState(s){
 if(!s)return;
 if(s.model)modelEl.textContent=s.model;
 if(s.thinkingLevel){level=s.thinkingLevel;levelBtn.textContent=level}
 if(s.followOn){const nm=s.followName||(s.followFile?"…":"");sessEl.textContent="◞ watching: "+(s.followBusy?"⏳ ":"")+nm;sessEl.title=(s.followFile||"")+" — auto-follow (live session)"}
 else sessEl.textContent=s.sessionName&&s.sessionName!=="(unnamed)"?s.sessionName:"";
 connected=true;setConn(true);
}
function onLine(line){
 if(!line||line[0]==="\uFEFF")return;
 line=line.trim();if(!line)return;
 let env;try{env=JSON.parse(line)}catch(e){return}
 if(env.s>cursor)cursor=env.s;
 const ev=env.e||env;const t=ev.type;
 if(t==="status"){applyPubState(ev.state);return}
 if(t==="system"&&ev.note){addSys(ev.note);return}
 if(t==="extension_error"||t==="agent_error"){addSys("error: "+(ev.note||ev.error||""));return}
 if(t==="agent_start"){running=true;setConn(true);return}
 if(t==="agent_settled"||t==="agent_end"){
   const willRetry=ev.willRetry;
   running=false;curText=null;curThink=null;setConn(true);
   if(!willRetry)scrollBottom();
   return;
 }
 if(t==="message_start"||t==="message_end"){streamMsg(ev);return}
 if(t==="message_update"){streamMsg(ev);return}
 if(t==="tool_execution_start"||t==="tool_execution_end"){streamTool(ev);return}
 if(t==="compaction_start")addSys("compacting…");
 else if(t==="compaction_end")addSys("compaction done");
 else if(t==="thinking_level_changed"&&ev.level){level=ev.level;levelBtn.textContent=level;addSys("thinking: "+level)}
 else if(t==="session_info_changed"&&ev.name)sessEl.textContent=ev.name;
}
async function fetchState(){
 try{
  const j=await api("/api/state");
  if(!j){ // 403 -> api() already called showAuth(); surface it as a dead-connection too
   if(!connected) setConnFail(new Error("bad token"));
   return false;
  }
  cursor=j.seq||0;
  applyPubState(j.state);
  return true;
 }catch(e){
  if(!connected) setConnFail(e);
  return false;
 } finally{ if(connected&&connTimer){clearInterval(connTimer);connTimer=null;connRetry=0} }
}
async function pollLoop(){
 let fail=0,wasErr=false;
 for(;;){
  try{
   const txt=await api(`/api/poll?cursor=${cursor}`); // 403 -> null (auth screen shown); net hang -> throws after 60s
   if(txt===null){ showAuth(); return; } // bad/expired token — stop polling
   if(typeof txt==="string"){
    if(txt){for(const line of txt.split("\n")){onLine(line);}}
    fail=0;wasErr=false;
   }else{ fail++; if(fail>1)setConn(false); wasErr=true; }
  }catch(e){
   fail++; if(fail>1)setConn(false); wasErr=true;
   // a network hiccup may have missed events we can't see while offline — resync seq from the server
   if(fail>1){ try{const j=await api("/api/state"); if(j)cursor=j.seq||0;}catch(e2){} }
  }
  // keep the cadence: the server holds the poll up to 45s and streams heartbeats; on error, back off a bit
  await new Promise(r=>setTimeout(r, wasErr?2500:1200));
 }
}
async function reasyncNow(){ // mobile browsers freeze timers/sockets in background or on idle TCP; snap back to the latest state on wake
 try{ if(document.hidden)return; const j=await api("/api/state"); if(j){cursor=j.seq||0;applyPubState(j.state);} else return; setConn(true); }catch(e){}
}
document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ reasyncNow(); } });
window.addEventListener("pageshow",(e)=>{ if(e.persisted||!document.hidden){ reasyncNow(); } });
// ---------------- notifications ----------------
let seenNotifs=0,notifBox=null,badge=null;
async function apiNotify(drainMs){ /* server long-polls; returns [] on wait-timeout */
  try{const t=await api("/api/notify?timeout="+drainMs);return Array.isArray(t)?t:[]}catch(e){return []}
}
async function drainNotifs(){
  for(let i=0;i<60;i++){const b=await apiNotify(400);if(!b.length)return;for(const x of b)pushNotif(x)}
  toastMsg("too many pending notifications – refreshed");
}
function pushNotif(x){
  seenNotifs=Math.max(seenNotifs,x.at||0);
  const item=el("div","notif");
  item.appendChild(el("div","t",x.title||""));
  if(x.text)item.appendChild(el("div","x",x.text));
  item.onclick=()=>{switchTab("sess");item.remove()};
  notifBox.prepend(item);
  const count=notifBox.children.length;
  if(badge){badge.hidden=!count;badge.textContent=String(count)}
}
async function pollNotifs(){
  let seeded=false;
  try{
    for(;;){
      const batch=await apiNotify(10000);
      if(!Array.isArray(batch))break; // 403/token invalid -> stop looping, token screen is showing
      if(batch.length){
        if(!seeded){seeded=true;for(const x of batch)seenNotifs=Math.max(seenNotifs,x.at||0)}
        else for(const x of batch)if(x.at>seenNotifs)pushNotif(x);
      }
    }
  }catch(e){await new Promise(r=>setTimeout(r,3000))}
}
// ---------------- views / tabs ----------------
function currentView(){
 if(!$("#v-mview").hidden)return "mview";
 if(!$("#v-sess").hidden)return "sess";
 return "chat";
}
function _safe(el,fn){try{if(el)fn(el)}catch(e){console.error("guard:",e)}}
function switchTab(v){
 const views={chat:$("#v-chat"),sess:$("#v-sess"),mview:$("#v-mview")};
 let bad=Object.keys(views).filter(k=>!views[k]);
 if(bad.length){toastMsg("UI out of sync (missing "+bad.join(",").replace("#","")+") — reloading page",6000);location.reload();return}
 for(const k in views)views[k].hidden=(k!==v);
 $("#tab-chat").classList.toggle("act",v==="chat");
 $("#tab-sess").classList.toggle("act",v==="sess"||v==="mview");
 if(v==="sess"){
  if(notifBox)notifBox.innerHTML="";
  if(badge)badge.hidden=true;
  loadSessions();
 } else if(v==="chat"){renderMirror();if(!running&&pendingResume){const f=pendingResume;pendingResume=null;refreshChat(f);}}
 scrollBottom();
}
$("#tab-chat").addEventListener("click",()=>switchTab("chat"));
$("#tab-sess").addEventListener("click",()=>{switchTab("sess")});
$("#mvback").addEventListener("click",()=>switchTab("sess"));
$("#mvgobtn").addEventListener("click",async e=>{
 e.stopPropagation();
 const file=viewFile;if(!file)return;
 const b=e.currentTarget;b.disabled=true;
 const r=await api("/api/resume",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({file})});
 b.disabled=false;
 if(r&&r.error){toastMsg(r.error);return;}
 setAgentFile(file);
 freshAgentFlag=true; pendingResume=file;
 switchTab("chat");
});

function setAgentFile(rel){try{if(rel)localStorage.setItem("pibridge_agentfile",rel);else localStorage.removeItem("pibridge_agentfile");}catch(e){}}
async function refreshChat(){
 try{
  const j=await api("/api/messages");if(!j)return;
  chat.innerHTML="";for(const k in toolMap)delete toolMap[k];
  for(const m of (j.messages||[]))renderMsg(m,chat);
  if(!j.messages.length){const h=el("div","body");const sp=el("span",null,"— nothing here yet —\nthis is the live conversation (agent idle). type below to reply, or switch sessions from the Sessions tab.");sp.style.opacity=".7";h.appendChild(sp);const row=el("div","msg meta");row.appendChild(h);chat.appendChild(row);}
  const st=await api("/api/state");
  const agent=localStorage.getItem("pibridge_agentfile");
  const name=st&&st.state&&st.state.sessionName;
  const fresh=freshAgentFlag; freshAgentFlag=false;
  if(agent&&fresh){const f2=agent.split("/").pop()||"";addSys("\u21a9 you are now replying in: "+(name&&name!=="(unnamed)"?name:"this session (…"+f2.slice(0,8)+")")+" — you can type below now");}
  if(st){cursor=st.seq||0;const f=st.follow||{};const sb=$("#sess");if(sb){const rel=f.file||"";const nm=(f.name&&f.name!=="(unnamed)")?f.name:(rel.split("/").pop()||"").slice(0,20);sb.textContent=nm?"\u2b07 "+nm:"";sb.title=rel||"";}}
  scrollBottom();
 }catch(e){}
}
function fmtAgo(ts){if(!ts)return"?";const s=(Date.now()-ts)/1000;if(s<60)return"now";if(s<3600)return Math.floor(s/60)+"m ago";if(s<86400)return Math.floor(s/3600)+"h ago";return Math.floor(s/86400)+"d ago"}
let headCache=[];
async function loadSessions(){
 const list=$("#slist");
 let d;try{d=await api("/api/sessions")}catch(e){return}
 if(!d)return;
 const f=d.follow||{};
 const mine=f.file||"";                                          // item being followed is "mine"
 list.innerHTML="";
 const byProj=new Map();
 for(const it of (d.sessions||[])){
  const proj=it.project||it.file.split("/")[0];
  if(!byProj.has(proj))byProj.set(proj,new Map());
  byProj.get(proj).set(it.file,it);
 }
 let any=false;
 let afTplDone=false;
 byProj.forEach((mm,proj)=>{
  const projEl=el("div","sproj",proj.split("/").filter(Boolean).slice(-1)[0]||proj||"?");
  if(globalThis.__af){
   if(!afTplDone){list.prepend(globalThis.__af.tplRow());afTplDone=true;}
   const anySess=mm.values().next().value;
   if(anySess){const dirName=anySess.file.split("/")[0];globalThis.__af.decorate(projEl,dirName);}
  }
  list.appendChild(projEl);
  const arr=[...mm.values()].sort((a,b)=>(b.mtime||b.firstTs||b.ts||0)-(a.mtime||a.firstTs||a.ts||0));
  for(const it of arr){any=true;
   const mineThis=it.file===mine;
   const card=el("div","sitem"+(mineThis?" live":""));
   if(it.title)card.appendChild(el("div","tt",it.title));
   const mt=el("div","mt");
   const when=it.mtime||it.firstTs||it.ts;
   const whenTxt=when?(Number(when)>1e12?new Date(when):new Date(Number(when)*1000)).toLocaleString():"";
   mt.appendChild(el("span",null,whenTxt+(it.size?" · "+Math.round(it.size/1024)+" KB":"")));
   if(mineThis){const fb=el("b");fb.textContent=f.on?(f.busy?"⏳ working":"🟢 idle"):"▶ following";mt.appendChild(fb);}
   card.appendChild(mt);
   const foot=el("div","sfoot");
   const fbtn=el("button","fbtn");
   if(mineThis){fbtn.textContent=f.on?"⏹ Stop":""+ (f.busy?"⏳":"🟢");fbtn.type="button";foot.appendChild(el("span",null,f.ongoing?"ongoing":"one-shot"));}
   else{fbtn.textContent="▶ Follow";fbtn.type="button";
    const ob=el("button","fbtn ghost");ob.type="button";ob.textContent="ongoing";ob.title="keep following across prompts";foot.appendChild(ob);}
   fbtn.onclick=async(e)=>{e.stopPropagation();fbtn.disabled=true;
    const p=await api("/api/sessions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(mineThis?{follow:false}:{follow:it.file,ongoing:false})});
    fbtn.disabled=false;if(p&&p.error)toastMsg(p.error);else loadSessions();};
   if(!mineThis){const ob=foot.querySelector(".ghost");if(ob)ob.onclick=async(e)=>{e.stopPropagation();const p=await api("/api/sessions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({follow:it.file,ongoing:true})});if(p&&p.error)toastMsg(p.error);else toastMsg("following (ongoing)");};}
   foot.appendChild(fbtn);
   if(!mineThis){
    const db=el("button","fbtn ghost dangerb");db.type="button";db.textContent="🗑 delete";db.title="delete this session file ("+it.file+")";let armed=false,armT=null;
    const disarm=()=>{if(!armed)return;armed=false;db.textContent="🗑 delete";db.classList.add("ghost");db.classList.remove("dangerb")};
    db.onclick=async(e)=>{e.stopPropagation();
     if(!armed){armed=true;clearTimeout(armT);db.textContent="sure?";db.classList.remove("ghost");db.classList.add("dangerb");armT=setTimeout(disarm,3000);return;}
     clearTimeout(armT);disarm();db.disabled=true;
     const p=await api("/api/sessions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({delete:it.file})});
     db.disabled=false;
     if(p&&p.error)toastMsg(p.error);
     else toastMsg("session deleted");
     loadSessions();
    };
    foot.appendChild(db);
   }
   card.appendChild(foot);
   const doOpen=async()=>{
    const r=await api("/api/session-view?file="+encodeURIComponent(it.file));
    if(!r)return;
    viewFile=it.file;
    $("#mvtitle .tt").textContent=proj+(r.title?"\n“"+r.title+"”":"");
    const mc=$("#mchat");mc.innerHTML="";for(const k in toolMap)delete toolMap[k];
    for(const m of (r.messages||[]))renderFlat(m,mc);
    mc.scrollTop=mc.scrollHeight;
    switchTab("mview");
   };
   card.addEventListener("click",doOpen);
   list.appendChild(card);
  }
 });
 if(!any)list.appendChild(el("div","sproj","no sessions found"));
}
// renderer for the flat session-view message shape {role,text,thinking,tools,ts}
function renderFlat(m,box){
 const role=m.role||"assistant";
 if(role==="user"){const u=el("div","m user");u.appendChild(el("div","bub user",m.text||""));box.appendChild(u);}
 else{
  const a=el("div","m pi");
  if(m.thinking)a.appendChild(el("div","th",m.thinking));
  if(m.text)a.appendChild(el("div","bx pi",m.text));
  if(Array.isArray(m.tools)&&m.tools.length)a.appendChild(el("div","tt","🔧 "+m.tools.join(", ")));
  box.appendChild(a);
 }
}
// ---------------- live PC mirror

// ---------------- live PC mirror (chat tab) ----------------
let mirrorTimer=null;
function mirrorCard(){
 let card=$("#pcmirror");
 if(!card||!card.isConnected){card=el("div","mirror");card.id="pcmirror";$("#v-chat").insertBefore(card,$("#chat"));}
 return card;
}
function renderMirror(once){
 api("/api/sessions").then(d=>{
  if(currentView()!=="chat")return;
  const f=d&&d.follow;
  if(!f||!f.on){const c=$("#pcmirror");if(c)c.remove();mirrorTimer=null;return;}
  const card=mirrorCard();card.innerHTML="";
  const h=el("div","h");
  h.appendChild(el("span",null,"📡 PC mirror"));
  h.appendChild(el("b",null,(f.busy?"⏳":"🟢")+" "+(f.project||"")+(f.ongoing?" (ongoing)":"")));
  h.appendChild(el("span","sp"));
  const stop=el("button",null,"stop");
  stop.onclick=async()=>{await api("/api/sessions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({follow:false})});renderMirror();};
  h.appendChild(stop);card.appendChild(h);
  for(const m of (f.msgs||[]))card.appendChild(mirrorRow(m));
  if(once)return;
  clearMirrorTimer();
  mirrorTimer=setInterval(()=>{if(currentView()==="chat")renderMirror()},2500);
 }).catch(()=>{});
}
function clearMirrorTimer(){if(mirrorTimer){clearInterval(mirrorTimer);mirrorTimer=null}}
function mirrorRow(m){
 const r=el("div","row "+(m.r==="you"?"you":"pi"));
 r.appendChild(el("span","r",m.r==="you"?"you":"pi"));
 r.appendChild(el("span",null,String(m.t||"").slice(0,160)));
 return r;
}
// ---------------- controls ----------------
document.getElementById("composer").addEventListener("submit",async e=>{
 e.preventDefault();
 const t=input.value.trim();
 if(!t||!TOKEN)return;
 input.value="";input.style.height="auto";
 {const m=addMsg(chat,"user");setMd(m.md,t)}
 const r=await api("/api/send",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:t})});
 if(!r)return;
 if(r&&r.error)toastMsg(r.error,4000);
});
input.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.getElementById("composer").requestSubmit();}
});
levelBtn.addEventListener("click",async()=>{
 const r=await api("/api/level",{method:"POST"});
 if(r&&r.level){level=r.level;levelBtn.textContent=level;addSys("thinking: "+level)}
});
newBtn.addEventListener("click",async()=>{
 const r=await api("/api/new-session",{method:"POST"});
 addSys("— new session —");chat.innerHTML="";for(const k in toolMap)delete toolMap[k];
 const j=await api("/api/state");if(j)cursor=j.seq||0;
});
abBtn.addEventListener("click",async()=>{
 await api("/api/abort",{method:"POST"});addSys("stop requested");
});
// ---------------- auth + init ----------------
// ---------------- web push (service worker + PushManager) ----------------
function urlB64ToB64(s){ s = String(s).replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4) s += "="; return s; }
let pushBtn = null;
function ntfyHint(){
 toastMsg("tip: reliable fallback = any ntfy app subscribed to http://100.121.26.79:3333/ topic 'pibridge' (PC pushes there too)",8000);
}
function setPushOn(on){ if(pushBtn){ pushBtn.textContent = on ? "🔔✓" : "🔔"; pushBtn.title = on ? "notifications on" : "enable notifications"; } }
async function enablePush(){
 if(!window.isSecureContext){ toastMsg("needs HTTPS — open via the https:// tailscale URL"); return; }
 if(!("Notification" in window)){ toastMsg("this browser has no Notifications API"); return; }
 if(!("serviceWorker" in navigator) || !("PushManager" in window)){ toastMsg("no Web Push support here"); return; }
 try{
  let perm = Notification.permission;
  if(perm !== "granted" && perm !== "denied") perm = await Notification.requestPermission();
  if(perm !== "granted"){ toastMsg("notification permission not granted"); return ntfyHint(); }
  const reg = await navigator.serviceWorker.register("/sw.js");
  const vk = await (await fetch("/api/push/vapid-key")).json();
  const appKey = Uint8Array.from(atob(urlB64ToB64(vk.publicKey)), c=>c.charCodeAt(0));
  // Capture any prior push subscription first so we can unsubscribe it after
  // re-subscribing. FCM rotates device push endpoints over time; if the old
  // endpoint dies server-side we must drop it — POSTing only the new one
  // would leave both registered, and a fanout that hits the dead one 410s
  // until we eventually clean it up manually.
  const prior = await reg.pushManager.getSubscription();
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
  if (prior && prior.endpoint !== sub.endpoint) { try{ await prior.unsubscribe(); }catch(_){} }
  api("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub.toJSON()) })
   .then(r=>{ if(r&&r.ok){ setPushOn(true); toastMsg("notifications enabled ✅"); } else { toastMsg("subscribe failed (HTTP "+r.status+")",6000); } });
 }catch(e){ toastMsg("push error: "+e.message); }
}
function initPushUI(){
 pushBtn = $("#pushbtn");
 if(pushBtn) pushBtn.addEventListener("click", enablePush);
 // reflect existing subscription state
 if("serviceWorker" in navigator && location.protocol === "https:" ){
  navigator.serviceWorker.getRegistration().then(async r=>{
   if(!r) return;
   try{ const s = await r.pushManager.getSubscription(); if(s) setPushOn(true); }catch(e){}
  }).catch(()=>{});
 }
}
initPushUI();

function locOf(ev){const f=String((ev.error&&ev.error.stack)||"").split("\n").find(l=>/app\.js/.test(l))||"";const pos=(ev.filename&&ev.lineno)?(ev.filename.split("/").pop())+":"+ev.lineno:"";return (pos?"  ["+pos+"]  ":"")+f.trim().slice(0,80)}
window.addEventListener("error",ev=>{window.__lastErr=String(ev.message||"")+" "+locOf(ev);document.title="ERR: "+ev.message||"";toastMsg("JS ERROR: "+(ev.message||"")+locOf(ev),12000);console.error(ev)});
window.addEventListener("unhandledrejection",ev=>{toastMsg("ASYNC ERROR: "+((ev.reason&&ev.reason.message)||ev.reason),8000);console.error(ev.reason)});
function doInit(){
 const saved=localStorage.getItem("pibridge_token");
 const urlTok=new URLSearchParams(location.search).get("token");
 TOKEN=urlTok||saved||"";
 if(urlTok){try{localStorage.setItem("pibridge_token",urlTok)}catch(e){}}
 if(!TOKEN){showAuth();return}
 auth.hidden=true;
 // Keep the token in the URL as a cross-reload fallback, but scrub it out of the address
 // bar once we KNOW localStorage holds it. If storage is unavailable/cleared (private mode,
 // "clear data on exit"), the plain refresh keeps working because the URL still carries it.
 if(urlTok){try{if(localStorage.getItem("pibridge_token")===urlTok){history.replaceState(null,"","/");}}catch(e){}}
 else{try{history.replaceState(null,"","/")||0}catch(e){location.hash="";history.replaceState(null,"","/")}}
 notifBox=$("#notifs");
 badge=$("#badge");
 fetchState().then(async(ok)=>{
  if(!ok){ if(!auth.hidden)return; setConnFail(new Error("connect failed")); return; }
  addSys("connected · build "+BUILD);
  try{
   const mj=await api("/api/messages");
   if(mj){const arr=Array.isArray(mj)?mj:(mj.messages||[]);for(const m of arr)renderMsg(m,chat);}
  }catch(e){}
  renderMirror();
  pollLoop();
  pollNotifs();
 });
}
function submitToken(){
 const v=document.getElementById("token").value.trim();
 if(!v){authErr.textContent="paste the token";return}
 authErr.textContent="checking…";
 TOKEN=v; // verify the pasted value, not the stale stored one
 api("/api/state").then(r=>{
  if(r){ location.replace("/?token="+encodeURIComponent(v)); }
  else{ auth.hidden=false; authErr.textContent="that token was rejected (403). paste the exact token from the PC:  cat ~/.config/pibridge/token"; }
 }).catch(()=>{ auth.hidden=false; authErr.textContent="server unreachable"; });
}
tokGo.addEventListener("click",submitToken);
document.getElementById("token").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();submitToken()}});


// ---------- per-project agent files (agent_instructions.md / agent_backlog.md) ----------
// Add-on. Reuses .fbtn/.fbtn.ghost classes only; all layout is inline so it never
// collides with the embedded snapshot. loadSessions() calls __af.decorate(el,dir) to
// attach inline [instr][backlog] buttons onto the existing .sproj caption and prepends
// a "agent templates ✎" row once per loadSessions so you can edit the standard templates.
// All data flows through /api/agent-files and /api/agent-templates (server.js).
(function(){
 const FILENAME={instructions:"agent_instructions.md",backlog:"agent_backlog.md"};
 let tcache=null;
 const getTpl=()=> (tcache&&tcache.templates)
   ? Promise.resolve(tcache.templates)
   : api("/api/agent-templates").then(d=>{ if(d&&d.templates)tcache=d; return (tcache&&tcache.templates)||{} }).catch(()=>({}));
 function showPfo(o){ // o:{label,note,initText,primary,secondary,cancelClose,onReady}
  let root=document.getElementById("pforoot");
  if(!root){ root=document.createElement("div"); root.id="pforoot";
   root.style.cssText="position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(6,8,12,.72)";
   document.body.appendChild(root); }
  root.style.display="flex";
  const box=document.createElement("div");
  box.style.cssText="width:min(94vw,640px);max-height:88vh;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden";
  const head=document.createElement("div");
  head.style.cssText="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line)";
  const t=document.createElement("span"); t.style.cssText="flex:1;font-size:13px;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"; t.textContent=o.label;
  const close=document.createElement("button"); close.className="fbtn ghost"; close.type="button"; close.textContent="close"; close.style.cssText="flex:0 0 auto;padding:5px 11px";
  close.onclick=hidePfo;
  head.appendChild(t); head.appendChild(close);
  const note=document.createElement("div"); note.style.cssText="padding:9px 12px 0;font-size:11px;line-height:1.45;color:var(--dim);white-space:pre-line"; note.textContent=o.note||"";
  const body=document.createElement("div"); body.style.cssText="flex:1;min-height:0;display:flex;overflow:auto";
  const ta=document.createElement("textarea"); ta.value=o.initText==null?"":o.initText; ta.spellcheck=false;
  ta.style.cssText="flex:1;width:100%;min-height:300px;resize:vertical;background:var(--panel2);color:var(--fg);border:0;border-top:1px solid var(--line);padding:11px 12px;font:13px/1.55 ui-monospace,Menlo,monospace;box-sizing:border-box";
  body.appendChild(ta);
  const foot=document.createElement("div"); foot.style.cssText="display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line)";
  const addBtn=(txt,primary,onClick)=>{const b=document.createElement("button");b.className="fbtn";b.type="button";b.textContent=txt;if(primary){b.style.cssText="flex:0 0 auto;padding:7px 18px;background:var(--acc);color:#04121f;border:0;margin-left:auto"}else{b.style.cssText="flex:0 0 auto;padding:7px 14px;border-style:dashed;color:var(--dim)"}b.onclick=onClick;foot.appendChild(b);return b};
  if(o.secondary) addBtn(o.secondary.txt,false,o.secondary.onClick);
  if(o.primary)   addBtn(o.primary.txt,true,o.primary.onClick);
  box.appendChild(head); box.appendChild(note); box.appendChild(body); box.appendChild(foot);
  root.innerHTML=""; root.appendChild(box);
  root._ta=ta;
  if(o.cancelClose!==false){ root.onclick=e=>{ if(e.target===root) hidePfo(); }; } else { root.onclick=null; }
  if(o.onReady) o.onReady(ta);
 }
 function hidePfo(){ const r=document.getElementById("pforoot"); if(r) r.style.display="none"; }
 const rootTa=()=>{const r=document.getElementById("pforoot");return r&&r._ta?r._ta:null};
 function openFile(dir,key){
  getTpl().then(tpls=>{
   api("/api/agent-files?dir="+encodeURIComponent(dir)+"&key="+key).then(d=>{
    if(!d) return;
    if(d.error){ toastMsg(d.error); return; }
    const exists=!!d.exists;
    showPfo({
     label: FILENAME[key],
     note: exists
       ? "file exists on the PC\n"+ (d.cwd||dir)
       : "this project has no "+FILENAME[key]+" yet.\nThe text below is the standard template — keep it as is, or tweak it, then “create file” to write it into the project. You can edit it from here any time.",
     initText: exists ? (d.content||"") : (tpls[key]||""),
     cancelClose:true,
     onReady(ta){ if(!exists){ ta.style.borderColor="var(--warn)"; } },
     primary:{ txt: exists ? "save" : "create file", onClick(){
       const ta=rootTa(); if(!ta) return;
       api("/api/agent-files?dir="+encodeURIComponent(dir)+"&key="+key,
         {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({content:ta.value})})
        .then(r=>{ if(r&&r.error) { toastMsg(r.error); return; } toastMsg((exists?"saved ":"created ")+FILENAME[key]); hidePfo(); loadSessions(); });
     }},
    });
   }).catch(()=>{});
  });
 }
 function openTpl(key){
  getTpl().then(tpls=>{
   const cur={instructions:(tpls.instructions||""),backlog:(tpls.backlog||"")};
   showPfo({
    label:"template · "+FILENAME[key],
    note:"This is the standard content used to create a MISSING "+FILENAME[key]+" in any project.\nStored on the PC; editing it does not change files that already exist.\n“reset” restores the built-in default.",
    initText:cur[key]||"",
    cancelClose:true,
    secondary:{ txt:"reset", onClick(){ const ta=rootTa(); if(ta) ta.value=cur[key]||""; }},
    primary:{ txt:"save template", onClick(){
      const ta=rootTa(); if(!ta) return;
      const val=ta.value; cur[key]=val;
      api("/api/agent-templates",
        {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(cur)})
       .then(r=>{ if(r&&r.error){ toastMsg(r.error); return; } tcache=r&&r.templates?r:{templates:cur}; toastMsg("template saved"); hidePfo(); });
     }},
   });
  });
 }
 function decorate(nameEl,dir){ // nameEl = existing .sproj caption (holds the project name)
  nameEl.style.cssText=(nameEl.getAttribute("style")||"")+"display:flex;align-items:center;gap:6px";
  const nm=document.createElement("span"); nm.textContent=nameEl.textContent;
  nm.style.cssText="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis";
  nameEl.innerHTML=""; nameEl.appendChild(nm);
  const mk=(label,key)=>{ const b=document.createElement("button"); b.className="fbtn ghost"; b.type="button"; b.textContent=label; b.title=FILENAME[key]; b.style.cssText="flex:0 0 auto;padding:3px 9px"; b.onclick=e=>{e.stopPropagation();openFile(dir,key)}; return b; };
  nameEl.appendChild(mk("instr","instructions"));
  nameEl.appendChild(mk("backlog","backlog"));
 }
 function tplRow(){
  if(document.getElementById("aftplrow")) return document.getElementById("aftplrow");
  const row=document.createElement("div"); row.id="aftplrow";
  row.style.cssText="display:flex;align-items:center;gap:6px;margin:0 2px 4px;padding:2px 0;border-bottom:1px dashed var(--line)";
  const nm=document.createElement("span"); nm.textContent="agent templates"; nm.title="edit the standard content used to create these files";
  nm.style.cssText="flex:1;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px";
  row.appendChild(nm);
  const mk=(label,key)=>{ const b=document.createElement("button"); b.className="fbtn ghost"; b.type="button"; b.textContent=label; b.title="edit the "+FILENAME[key]+" template"; b.style.cssText="flex:0 0 auto;padding:2px 9px"; b.onclick=e=>{e.stopPropagation();openTpl(key)}; return b; };
  row.appendChild(mk("instr ✎","instructions"));
  row.appendChild(mk("backlog ✎","backlog"));
  return row;
 }
 globalThis.__af={decorate,tplRow,openFile,openTpl,fileName:FILENAME};
})();

doInit();

// ---- boot diagnostic: report what the browser actually rendered ----
(function __diag(){
 try{
  var d=document;
  var send=function(){
   var ids=["#v-chat","#v-sess","#v-mview","#chat","#slist"].map(function(x){return x+":"+(!!d.getElementById(x))}).join(",");
   var au=d.getElementById("auth");
   fetch("/api/diag",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ua:navigator.userAgent,sr:(screen?screen.width+"x"+screen.height:"?"),build:window.BUNDLE||"?",htmlLen:(d.documentElement&&d.documentElement.outerHTML||"").length,bodyLen:d.body?d.body.innerHTML.length:-1,ids:ids,authHidden:au?au.hidden:null})}).catch(function(){});
  };
  send();
  window.addEventListener("load",function(){setTimeout(send,3000)});
 }catch(e){}
})();

