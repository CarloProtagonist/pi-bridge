;(function(){
 window.__PB_REWRITTEN=false;
 try{
  if(document.getElementById("freshcan"))return;
  const B64="PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCB2aWV3cG9ydC1maXQ9Y292ZXIiPgo8bWV0YSBuYW1lPSJhcHBsZS1tb2JpbGUtd2ViLWFwcC1jYXBhYmxlIiBjb250ZW50PSJ5ZXMiPgo8bWV0YSBuYW1lPSJ0aGVtZS1jb2xvciIgY29udGVudD0iIzBmMTExNSI+Cjx0aXRsZT5waSBicmlkZ2U8L3RpdGxlPgo8c3R5bGU+Cjpyb290ewogLS1iZzojMGYxMTE1OyAtLXBhbmVsOiMxNzFhMjE7IC0tcGFuZWwyOiMxYzIwMjc7IC0tbGluZTojMjYyYjM1OwogLS1mZzojZTZlOWVmOyAtLWRpbTojOGI5M2ExOyAtLWFjYzojNmVhOGZlOyAtLWdvb2Q6IzNmYjk1MDsgLS13YXJuOiNkMjk5MjI7IC0tZXJyOiNmODUxNDk7IC0tdGg6Izg5NTdjOTsgLS10b29sOiMzZDhiYjU7Cn0KKntib3gtc2l6aW5nOmJvcmRlci1ib3h9Cmh0bWwsYm9keXttYXJnaW46MDtwYWRkaW5nOjA7aGVpZ2h0OjEwMGR2aDtiYWNrZ3JvdW5kOnZhcigtLWJnKTtjb2xvcjp2YXIoLS1mZyk7CiBmb250OjE2cHgvMS40NSAtYXBwbGUtc3lzdGVtLHN5c3RlbS11aSxTZWdvZSBVSSxSb2JvdG8sc2Fucy1zZXJpZn0KI2FwcHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2hlaWdodDoxMDBkdmg7bWF4LXdpZHRoOjg2MHB4O21hcmdpbjowIGF1dG99CiN0b3BiYXJ7ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6OHB4IDEwcHg7YmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7CiBib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1saW5lKTtmbGV4LXdyYXA6d3JhcDtyb3ctZ2FwOjZweH0KI3RvcGJhciAuYnRuc3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtmbGV4LXdyYXA6d3JhcDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7bWF4LXdpZHRoOjYwJTtyb3ctZ2FwOjZweH0KI3RvcGJhciAuZG90e3dpZHRoOjlweDtoZWlnaHQ6OXB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tZGltKTtmbGV4Om5vbmV9CiN0b3BiYXIgLmRvdC5vbntiYWNrZ3JvdW5kOnZhcigtLWdvb2QpfQojdG9wYmFyIC5kb3QucnVue2JhY2tncm91bmQ6dmFyKC0tYWNjKTthbmltYXRpb246cHVsc2UgMXMgaW5maW5pdGV9CkBrZXlmcmFtZXMgcHVsc2V7NTAle29wYWNpdHk6LjM1fX0KI21vZGVse2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRpbSk7ZmxleDoxIDEgNDBweDttaW4td2lkdGg6MDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXB9CiNzZXNze2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRpbSk7bWF4LXdpZHRoOjM0dnc7ZmxleDowIDEgYXV0bzttaW4td2lkdGg6MDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXB9CmJ1dHRvbntmb250OmluaGVyaXQ7YmFja2dyb3VuZDp2YXIoLS1wYW5lbDIpO2NvbG9yOnZhcigtLWZnKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogYm9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo1cHggMTBweDtjdXJzb3I6cG9pbnRlcjt0b3VjaC1hY3Rpb246bWFuaXB1bGF0aW9uO21pbi13aWR0aDowfQpidXR0b246YWN0aXZle29wYWNpdHk6LjZ9CmJ1dHRvbi5kYW5nZXJ7Ym9yZGVyLWNvbG9yOiM1YzJiMmI7Y29sb3I6dmFyKC0tZXJyKX0KYnV0dG9uOmRpc2FibGVke29wYWNpdHk6LjQ7Y3Vyc29yOmRlZmF1bHR9CiNjaGF0e2ZsZXg6MTtvdmVyZmxvdy15OmF1dG87b3ZlcnNjcm9sbC1iZWhhdmlvcjpjb250YWluO3BhZGRpbmc6MTBweDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0KLm1zZ3ttYXJnaW46MCAwIDEwcHg7ZGlzcGxheTpmbGV4O21pbi13aWR0aDowfQoubXNnIC5ib2R5e21heC13aWR0aDo4NSU7cGFkZGluZzo4cHggMTJweDtib3JkZXItcmFkaXVzOjE0cHg7YmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7CiBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO292ZXJmbG93LXdyYXA6YnJlYWstd29yZDt3b3JkLWJyZWFrOmJyZWFrLXdvcmR9Ci5tc2cubWV0YSAuYm9keXttYXgtd2lkdGg6MTAwJTtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlci1jb2xvcjp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kaW0pO2ZvbnQtc2l6ZToxMnB4fQoubXNnLnVzZXJ7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfQoubXNnLnVzZXIgLmJvZHl7YmFja2dyb3VuZDojMWUyYjQ1O2JvcmRlci1jb2xvcjojMmIzZDYxO2JvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzOjRweH0KLm1zZy5hc3Npc3RhbnQgLmJvZHl7Ym9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czo0cHh9Ci5tc2cgLndob3tmb250LXNpemU6MTBweDtsZXR0ZXItc3BhY2luZzouNXB4O3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtjb2xvcjp2YXIoLS1kaW0pO21hcmdpbi1ib3R0b206M3B4fQoubWR7d2hpdGUtc3BhY2U6cHJlLXdyYXA7Zm9udC1zaXplOjE1cHh9Ci5tZCBwcmV7YmFja2dyb3VuZDojMTExNDFhO3BhZGRpbmc6OHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo4cHg7CiBvdmVyZmxvdy14OmF1dG87Zm9udC1zaXplOjEycHg7bWFyZ2luOjRweCAwfQoubWQgcHJlIGNvZGUsLm1kIC5tb25ve2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxNZW5sbyxtb25vc3BhY2V9Ci50aGlua3ttYXJnaW46NnB4IDA7Zm9udC1zaXplOjEycHg7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkIHZhcigtLXRoKTtwYWRkaW5nOjJweCA4cHg7CiBjb2xvcjojYjlhMWRkO2JhY2tncm91bmQ6IzE3MTIxZDtib3JkZXItcmFkaXVzOjAgOHB4IDhweCAwfQoudGhpbmsgLmh7Y29sb3I6dmFyKC0tdGgpO2ZvbnQtd2VpZ2h0OjYwMDtjdXJzb3I6cG9pbnRlcjt1c2VyLXNlbGVjdDpub25lfQoudGhpbmsgLnR4dHt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtjb2xvcjojYTk5YmM0O2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxNZW5sbyxtb25vc3BhY2U7ZGlzcGxheTpub25lfQoudGhpbmsub3BlbiAudHh0e2Rpc3BsYXk6YmxvY2t9Ci50b29se21hcmdpbjo2cHggMDtmb250LXNpemU6MTJweDtib3JkZXItbGVmdDozcHggc29saWQgdmFyKC0tdG9vbCk7cGFkZGluZzo0cHggOHB4OwogYmFja2dyb3VuZDojMTExYTIyO2NvbG9yOiM5ZmM0ZGM7Ym9yZGVyLXJhZGl1czowIDhweCA4cHggMH0KLnRvb2wgLmh7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLXRvb2wpO2N1cnNvcjpwb2ludGVyO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxNZW5sbyxtb25vc3BhY2V9Ci50b29sIC5hLC50b29sIC5ye3doaXRlLXNwYWNlOnByZS13cmFwO2ZvbnQtZmFtaWx5OnVpLW1vbm9zcGFjZSxNZW5sbyxtb25vc3BhY2U7Zm9udC1zaXplOjExcHg7CiBjb2xvcjojN2Q5NWE4O2Rpc3BsYXk6bm9uZTttYXJnaW4tdG9wOjJweH0KLnRvb2wub3BlbiAuYSwudG9vbC5vcGVuIC5ye2Rpc3BsYXk6YmxvY2t9Ci50b29sIC5he21heC1oZWlnaHQ6MTIwcHg7b3ZlcmZsb3c6YXV0b30KLnRvb2wgLnJ7bWF4LWhlaWdodDoyMDBweDtvdmVyZmxvdzphdXRvfQoudG9vbCAuci5lcnJ7Y29sb3I6dmFyKC0tZXJyKX0KI2NvbXBvc2Vye2Rpc3BsYXk6ZmxleDtnYXA6OHB4O3BhZGRpbmc6OHB4IDhweCBtYXgoOHB4LGVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tKSk7YmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZSk7ZmxleDpub25lO2FsaWduLWl0ZW1zOmZsZXgtZW5kfQojaW5wdXR7ZmxleDoxO3Jlc2l6ZTpub25lO21heC1oZWlnaHQ6MTQwcHg7YmFja2dyb3VuZDp2YXIoLS1iZyk7Y29sb3I6dmFyKC0tZmcpOwogYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjEycHg7cGFkZGluZzo5cHggMTJweDtmb250OmluaGVyaXR9CiNpbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWFjYyl9CiNzZW5ke2FsaWduLXNlbGY6ZmxleC1lbmR9CiN0b2FzdHtwb3NpdGlvbjpmaXhlZDtsZWZ0OjUwJTtib3R0b206OTBweDt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTtiYWNrZ3JvdW5kOiMwMDBkOwogYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtwYWRkaW5nOjZweCAxNHB4O2JvcmRlci1yYWRpdXM6MjBweDtmb250LXNpemU6MTNweDsKIG9wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lO3RyYW5zaXRpb246b3BhY2l0eSAuMnM7bWF4LXdpZHRoOjgwdnc7ei1pbmRleDo4fQojdG9hc3Quc2hvd3tvcGFjaXR5OjF9CiN0YWJze2Rpc3BsYXk6ZmxleDtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1saW5lKTtmbGV4Om5vbmU7cGFkZGluZy1ib3R0b206bWF4KDBweCxlbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSkpfQojdGFicyBidXR0b257ZmxleDoxO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6MDtib3JkZXItYm90dG9tOjJweCBzb2xpZCB0cmFuc3BhcmVudDtwYWRkaW5nOjhweCA2cHg7Zm9udC1zaXplOjEzcHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aGl0ZS1zcGFjZTpub3dyYXB9CiN0YWJzIGJ1dHRvbi5hY3R7Ym9yZGVyLWJvdHRvbS1jb2xvcjp2YXIoLS1hY2MpO2NvbG9yOnZhcigtLWFjYyk7Zm9udC13ZWlnaHQ6NjAwfQojdmlld3N7cG9zaXRpb246cmVsYXRpdmU7b3ZlcmZsb3c6aGlkZGVuO2ZsZXg6MSAxIDAlO21pbi1oZWlnaHQ6MDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufQoudmlld3twb3NpdGlvbjphYnNvbHV0ZTtpbnNldDowO292ZXJmbG93OmhpZGRlbjtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufQoudmlld1toaWRkZW5de2Rpc3BsYXk6bm9uZX0KLm5vdGlme21hcmdpbjoxMHB4IDEwcHggMDtwYWRkaW5nOjhweCAxMnB4O2JvcmRlci1sZWZ0OjNweCBzb2xpZCB2YXIoLS13YXJuKTtiYWNrZ3JvdW5kOiMyMjFjMTA7Ym9yZGVyLXJhZGl1czowIDEwcHggMTBweCAwO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxNHB4fQoubm90aWYgLnR7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLXdhcm4pfQoubm90aWYgLnh7Y29sb3I6dmFyKC0tZGltKTtmb250LXNpemU6MTJweDttYXJnaW4tdG9wOjJweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfQoubWlycm9ye21hcmdpbjo4cHggMTBweDtiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjEwcHh9Ci5taXJyb3IgLmh7ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6Y2VudGVyO2ZsZXgtd3JhcDp3cmFwO2ZvbnQtc2l6ZToxM3B4fQoubWlycm9yIC5oIC5zcHtmbGV4OjF9Ci5taXJyb3IgLnJvd3twYWRkaW5nOjZweCAwO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2ZvbnQtc2l6ZToxM3B4O2Rpc3BsYXk6ZmxleDtnYXA6OHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9Ci5taXJyb3IgLnJvdyAucntmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kaW0pO21pbi13aWR0aDoyNnB4O3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtmb250LXdlaWdodDo3MDA7cGFkZGluZy10b3A6MnB4fQoubWlycm9yIC5yb3cueW91IC5ye2NvbG9yOnZhcigtLWFjYyl9Ci5taXJyb3IgLnJvdy5waSAucntjb2xvcjp2YXIoLS1nb29kKX0KLnNsaXN0e2ZsZXg6MTtvdmVyZmxvdy15OmF1dG87b3ZlcnNjcm9sbC1iZWhhdmlvcjpjb250YWluO3BhZGRpbmc6MTBweDstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaH0KLnNwcm9qe2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRpbSk7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2xldHRlci1zcGFjaW5nOi41cHg7bWFyZ2luOjE0cHggNHB4IDZweDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfQouc2l0ZW17YmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjEycHg7cGFkZGluZzo5cHggMTFweDttYXJnaW4tYm90dG9tOjhweDtjdXJzb3I6cG9pbnRlcn0KLnNpdGVtIC50dHtmb250LXNpemU6MTRweDtkaXNwbGF5Oi13ZWJraXQtYm94Oy13ZWJraXQtbGluZS1jbGFtcDoyOy13ZWJraXQtYm94LW9yaWVudDp2ZXJ0aWNhbDtvdmVyZmxvdzpoaWRkZW59Ci5zaXRlbSAubXR7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjNweDtkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7ZmxleC13cmFwOndyYXB9Ci5zaXRlbS5saXZle2JvcmRlci1jb2xvcjp2YXIoLS1nb29kKX0KLnNpdGVtLmxpdmUgLm10IGJ7Y29sb3I6dmFyKC0tZ29vZCl9Ci5zZm9vdHtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpjZW50ZXI7bWFyZ2luLXRvcDo4cHh9Ci5mYnRue2ZsZXg6MTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7cGFkZGluZzo2cHggMTBweDtib3JkZXItcmFkaXVzOjlweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JhY2tncm91bmQ6dmFyKC0tcGFuZWwyKTtjb2xvcjp2YXIoLS1mZyk7Y3Vyc29yOnBvaW50ZXI7dG91Y2gtYWN0aW9uOm1hbmlwdWxhdGlvbn0KLmZidG46YWN0aXZle29wYWNpdHk6Ljd9Ci5mYnRuW2Rpc2FibGVkXXtvcGFjaXR5Oi41fQouZmJ0bi5naG9zdHtmbGV4OjAgMCBhdXRvO2JvcmRlci1zdHlsZTpkYXNoZWQ7Y29sb3I6dmFyKC0tZGltKX0KLm12aWV3d3JhcHtmbGV4OjE7b3ZlcmZsb3cteTphdXRvO292ZXJzY3JvbGwtYmVoYXZpb3I6Y29udGFpbjtwYWRkaW5nOjQ2cHggMTBweCAxMHB4Oy13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOnRvdWNofQoubXYtYmFja3twb3NpdGlvbjphYnNvbHV0ZTt0b3A6OHB4O2xlZnQ6OHB4O3otaW5kZXg6MztwYWRkaW5nOjRweCAxMHB4fQoubXYtdGl0bGV7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZGltKTtwYWRkaW5nOjZweCAycHggOHB4O292ZXJmbG93LXdyYXA6YW55d2hlcmU7bGluZS1oZWlnaHQ6MS41O2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnR9Ci5tdi10aXRsZSAudHR7ZmxleDoxfQojbXZnb2J0bntmbGV4OjAgMCBhdXRvO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjcwMDtib3JkZXItY29sb3I6IzJiNGIyZjtiYWNrZ3JvdW5kOiMxNDI5MWE7Y29sb3I6dmFyKC0tZ29vZCk7Ym9yZGVyLXJhZGl1czo5cHg7cGFkZGluZzo1cHggMTBweDt0b3VjaC1hY3Rpb246bWFuaXB1bGF0aW9ufQojYmFkZ2V7YmFja2dyb3VuZDp2YXIoLS1lcnIpO2NvbG9yOiNmZmY7Ym9yZGVyLXJhZGl1czo4cHg7Zm9udC1zaXplOjEwcHg7cGFkZGluZzowIDVweDtmb250LXdlaWdodDo3MDA7bWFyZ2luLWxlZnQ6NHB4fQojYmFkZ2VbaGlkZGVuXXtkaXNwbGF5Om5vbmV9CiNhdXRoe3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7YmFja2dyb3VuZDp2YXIoLS1iZyk7ei1pbmRleDo5O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7CiBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MjBweH0KI2F1dGhbaGlkZGVuXXtkaXNwbGF5Om5vbmV9CiNhdXRoIC5jYXJke2JhY2tncm91bmQ6dmFyKC0tcGFuZWwpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxNnB4OwogcGFkZGluZzoyNHB4O21heC13aWR0aDozNDBweDt3aWR0aDoxMDAlO3RleHQtYWxpZ246Y2VudGVyfQojYXV0aCBpbnB1dHt3aWR0aDoxMDAlO21hcmdpbjoxMnB4IDA7cGFkZGluZzoxMHB4O2JhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLWZnKTsKIGJvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxMHB4O2ZvbnQ6aW5oZXJpdH0KOjotd2Via2l0LXNjcm9sbGJhcnt3aWR0aDo2cHh9Cjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWJ7YmFja2dyb3VuZDp2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjNweH0KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KPGRpdiBpZD0iYXBwIj4KPGRpdiBpZD0idG9wYmFyIj4KPHNwYW4gaWQ9InN0YXR1c2RvdCIgY2xhc3M9ImRvdCI+PC9zcGFuPgo8c3BhbiBpZD0ibW9kZWwiPmNvbm5lY3RpbmfigKY8L3NwYW4+CjxzcGFuIGlkPSJzZXNzIj48L3NwYW4+CjxzcGFuIGNsYXNzPSJidG5zIj4KPGJ1dHRvbiBpZD0ibHZsYnRuIiB0aXRsZT0idGhpbmtpbmcgbGV2ZWwiPj88L2J1dHRvbj4KPGJ1dHRvbiBpZD0ibmV3YnRuIj5uZXc8L2J1dHRvbj4KPGJ1dHRvbiBpZD0iYWJidG4iIGNsYXNzPSJkYW5nZXIiPnN0b3A8L2J1dHRvbj4KPGJ1dHRvbiBpZD0icHVzaGJ0biIgdGl0bGU9ImdldCB3ZWItcHVzaCBub3RpZmljYXRpb25zIG9uIHRoaXMgZGV2aWNlLlxuKHJlbGlhYmxlIGZhbGxiYWNrOiBhbnkgbnRmeSBhcHAgLyBwdXNoYnVsbGV0IC8gY3VybCBzdWJzY3JpYmVkIHRvIHRoaXMgc2VydmVyJ3MgcGlicmlkZ2UgdG9waWM6IGh0dHA6Ly8xMDAuMTIxLjI2Ljc5OjMzMzMvIik+8J+UlDwvYnV0dG9uPgo8L3NwYW4+CjwvZGl2Pgo8ZGl2IGlkPSJ2aWV3cyI+CjxkaXYgaWQ9InYtY2hhdCIgY2xhc3M9InZpZXciPgo8ZGl2IGlkPSJub3RpZnMiPjwvZGl2Pgo8ZGl2IGlkPSJjaGF0Ij48L2Rpdj4KPGZvcm0gaWQ9ImNvbXBvc2VyIj4KPHRleHRhcmVhIGlkPSJpbnB1dCIgcm93cz0iMSIgcGxhY2Vob2xkZXI9Im1lc3NhZ2XigKYgKGN0cmwvc2hpZnQrZW50ZXIgc2VuZHMgbXVsdGlsaW5lKSI+PC90ZXh0YXJlYT4KPGJ1dHRvbiBpZD0ic2VuZCI+c2VuZDwvYnV0dG9uPgo8L2Zvcm0+CjwvZGl2Pgo8ZGl2IGlkPSJ2LXNlc3MiIGNsYXNzPSJ2aWV3IiBoaWRkZW4+CjxkaXYgaWQ9InNsaXN0IiBjbGFzcz0ic2xpc3QiPjwvZGl2Pgo8L2Rpdj4KPGRpdiBpZD0idi1tdmlldyIgY2xhc3M9InZpZXciIGhpZGRlbj4KPGJ1dHRvbiBpZD0ibXZiYWNrIiBjbGFzcz0ibXYtYmFjayI+4oaQIHNlc3Npb25zPC9idXR0b24+CjxkaXYgY2xhc3M9Im12LXRpdGxlIiBpZD0ibXZ0aXRsZSI+PHNwYW4gY2xhc3M9InR0Ij48L3NwYW4+PGJ1dHRvbiBpZD0ibXZnb2J0biIgdHlwZT0iYnV0dG9uIj7ihqkgcmVwbHkgaGVyZTwvYnV0dG9uPjwvZGl2Pgo8ZGl2IGlkPSJtY2hhdCIgY2xhc3M9Im12aWV3d3JhcCI+PC9kaXY+CjwvZGl2Pgo8L2Rpdj4KPGRpdiBpZD0idGFicyI+CjxidXR0b24gaWQ9InRhYi1jaGF0IiBjbGFzcz0iYWN0Ij7wn5KsIGNoYXQ8L2J1dHRvbj4KPGJ1dHRvbiBpZD0idGFiLXNlc3MiPvCfl4Igc2Vzc2lvbnMgPHNwYW4gaWQ9ImJhZGdlIiBoaWRkZW4+MTwvc3Bhbj48L2J1dHRvbj4KPC9kaXY+CjwvZGl2Pgo8ZGl2IGlkPSJ0b2FzdCI+PC9kaXY+CjxkaXYgaWQ9ImF1dGgiIGhpZGRlbj48ZGl2IGNsYXNzPSJjYXJkIj48aDMgc3R5bGU9Im1hcmdpbjowIDAgNnB4Ij5waSBicmlkZ2U8L2gzPjxwIHN0eWxlPSJjb2xvcjp2YXIoLS1kaW0pO2ZvbnQtc2l6ZToxM3B4Ij5FbnRlciB0b2tlbiAob24gdGhlIG1hY2hpbmU6IH4vLmNvbmZpZy9waWJyaWRnZS90b2tlbik6PC9wPjxpbnB1dCBpZD0idG9rZW4iIHR5cGU9InBhc3N3b3JkIiBhdXRvY29tcGxldGU9Im9mZiIgcGxhY2Vob2xkZXI9InRva2VuIj48YnV0dG9uIGlkPSJ0b2tlbmdvIiBzdHlsZT0id2lkdGg6MTAwJSI+Y29ubmVjdDwvYnV0dG9uPjxwIHN0eWxlPSJjb2xvcjp2YXIoLS1lcnIpO2ZvbnQtc2l6ZToxMnB4O21hcmdpbi10b3A6OHB4IiBpZD0iYXV0aGVyciI+PC9wPjwvZGl2PjwvZGl2Pgo8c2NyaXB0IGlkPSJib290Ij5mZXRjaCgiL2FwcC5idW5kbGUuanMuc2hhMjU2IikudGhlbihyPT5yLnRleHQoKSkudGhlbih4dj0+e3ZhciBzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3Muc3JjPSIvYXBwLmJ1bmRsZS5qcz9oPSIreHYudHJpbSgpO3dpbmRvdy5CVU5ETEU9eHYudHJpbSgpO2RvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocyl9KS5jYXRjaCgoKT0+e2RvY3VtZW50LnRpdGxlPSJCT09UIEZBSUw6IGNhbm5vdCBsb2FkIGFwcC5qcyJ9KTwvc2NyaXB0Pgo8ZGl2IGlkPSJmcmVzaGNhbiIgaGlkZGVuPjwvZGl2Pgo8L2JvZHk+CjwvaHRtbD4K"
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
function setConn(ok,msg){connected=ok;dot.className="dot "+(running?"run":(ok?"on":""));if(msg)modelEl.textContent=msg;}
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
  if(!j)return;
  cursor=j.seq||0;
  applyPubState(j.state);
 }catch(e){}
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
 byProj.forEach((mm,proj)=>{
  list.appendChild(el("div","sproj",proj.split("/").filter(Boolean).slice(-1)[0]||proj||"?"));
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
 fetchState().then(async()=>{
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

