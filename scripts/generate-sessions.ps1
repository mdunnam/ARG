# Generate all 22 PTX-018 session detail pages
# Run from any directory. Outputs to G:\APPS\ARG\sites\somnatek\portal\ptx-018\

$outDir = "G:\APPS\ARG\sites\somnatek\portal\ptx-018"

$sessions = @(
  @{
    n=1; date="2009-03-11"; duration="7h 14m"; rating="2 / 5"
    sleepStages=@{WASO=22; REM=18; N1=8; N2=52; N3=20}
    narrative="Patient was cooperative during the baseline session. Following standard wakeup protocol, the debrief proceeded without unusual features. Patient reported minimal dream recall. No environmental or spatial elements described. Sleep onset latency within expected range."
    techNote="Baseline session. Standard protocol followed. No deviations. Environmental recall questionnaire administered. Patient responses: no recognizable location, no recurring elements, no notable sensory detail. All intake documentation complete."
    mdNote="Baseline established. No clinical anomalies. Schedule Session 02 in approximately four weeks."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=2; date="2009-04-08"; duration="7h 02m"; rating="2 / 5"
    sleepStages=@{WASO=18; REM=19; N1=7; N2=54; N3=22}
    narrative="Patient reported no substantial change in recall quality from Session 01. Post-sleep debrief was brief. Patient stated they did not remember much and could not describe any spatial or environmental detail. Mood was cooperative and unremarkable."
    techNote="No change from baseline. Standard questionnaire completed. Responses consistent with Session 01. No environmental elements identified. Sleep architecture within normal parameters."
    mdNote="Consistent with baseline. Continue per protocol."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=3; date="2009-05-06"; duration="6h 58m"; rating="3 / 5"
    sleepStages=@{WASO=14; REM=22; N1=6; N2=50; N3=18}
    narrative="Patient reported a slight increase in recall clarity compared to previous sessions. When asked to describe any spatial or environmental elements, the patient said they remembered 'a long hallway.' Could not describe the hallway further — no details about lighting, color, width, or contents. Patient appeared uncertain whether this was a memory of a specific place or simply a generalized spatial impression."
    techNote="Slight increase from baseline. First spatial element reported: 'a long hallway.' Patient could not elaborate. Did not appear distressed. No further prompting per protocol. Rating increased to 3/5."
    mdNote="Environmental element introduced. Monitor for consistency in subsequent sessions. Do not prompt for additional spatial detail."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=4; date="2009-06-03"; duration="7h 21m"; rating="3 / 5"
    sleepStages=@{WASO=16; REM=21; N1=7; N2=51; N3=21}
    narrative="Patient reported the hallway again without prompting. Description matched Session 03: a long hallway with no additional detail volunteered. Patient did not add new spatial elements. When asked if there was anything else, patient said they could not remember any more than the hallway."
    techNote="Spatial element consistent with Session 03. Hallway described again without prompting. No new detail. No additional elements. Rating held at 3/5."
    mdNote="Consistent with S03. Element appears stable. Continue without prompting."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=5; date="2009-07-01"; duration="7h 09m"; rating="3 / 5"
    sleepStages=@{WASO=20; REM=20; N1=8; N2=52; N3=20}
    narrative="Patient reported the hallway again. No additional spatial or sensory elements added. Patient then asked whether other study participants had described 'the same place.' The question was not addressed per protocol. Patient accepted this without apparent frustration. Debrief concluded normally."
    techNote="Patient asked whether other participants described the same location. Not addressed per protocol instruction. Patient did not press the question. No new recall elements. Rating 3/5."
    mdNote="Patient question logged. Consistent with emerging environmental awareness. Do not confirm or deny inter-participant consistency."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=6; date="2009-09-02"; duration="7h 33m"; rating="4 / 5"
    sleepStages=@{WASO=12; REM=24; N1=5; N2=48; N3=23}
    narrative="Patient reported a notable increase in environmental detail. Described a 'reception area' — a waiting space with seating. Also described a door, though could not specify its color or what it led to. These elements appeared alongside the hallway from previous sessions. Patient was calm and described everything in a matter-of-fact tone."
    techNote="Notable increase. New elements: reception area, a door. Hallway still present. Color of door not volunteered and not prompted. Rating increased to 4/5. No distress observed."
    mdNote="Significant increase in environmental complexity. Two new elements. Note progression rate between S05 and S06 — gap was two months, largest interval to date. May be relevant."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=7; date="2009-10-07"; duration="7h 18m"; rating="4 / 5"
    sleepStages=@{WASO=13; REM=23; N1=6; N2=49; N3=22}
    narrative="Patient confirmed all elements from Session 06: reception area, the door, and the hallway. Patient added a new detail: the hallway 'bends.' Could not specify direction. Described it as a curve rather than a sharp turn. Said they had not noticed this detail before and was uncertain whether it had always been there or was new."
    techNote="Consistent with S06. New element: bending corridor. Direction not specified. Patient uncertain whether this is a new observation or a previously unnoticed feature. Rating held at 4/5."
    mdNote="Bending corridor added. Direction unspecified — important to allow patient to volunteer direction independently if it is consistent with other cohort members. Do not prompt."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=8; date="2009-11-04"; duration="7h 44m"; rating="5 / 5"
    sleepStages=@{WASO=9; REM=26; N1=5; N2=47; N3=25}
    narrative="Patient provided the most detailed description to date. Hallway confirmed, bending corridor confirmed, reception area confirmed. Patient described the space as feeling 'institutional' and said it reminded them of a medical building, though they did not associate it with any specific place they had visited. All previous elements consistent. Rating increased to 5/5."
    techNote="Corridor description consistent with P-007 and P-014. Do not prompt.
All prior elements confirmed. Institutional quality of the space noted by patient without prompting. Rating 5/5."; mdNote="Full environmental consistency with cohort participants. Protocol alignment confirmed. Continue standard observation."; mdInitials="M.E."
    flagged=$true; keyClue="Corridor description consistent with P-007, P-014. Do not prompt."
  },
  @{
    n=9; date="2010-01-06"; duration="7h 52m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=27; N1=5; N2=46; N3=26}
    narrative="Patient described all familiar elements. Added one new element: a sense of 'waiting.' Could not clarify what they were waiting for or what prompted the feeling. Said it was not anxious waiting, but more like the ordinary experience of sitting in a waiting room before an appointment. Patient found the description difficult to articulate."
    techNote="New element: waiting. Patient described a passive quality of the space — waiting without urgency or expectation. Did not associate this with any other element. Rating 5/5."
    mdNote="'Waiting' element introduced. Ambiguous but consistent with reception environment. Log for cross-reference with cohort."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=10; date="2010-02-03"; duration="8h 01m"; rating="5 / 5"
    sleepStages=@{WASO=7; REM=28; N1=4; N2=46; N3=27}
    narrative="Patient reported all prior elements and provided an unprompted new detail: the door seen in Session 06 is blue. Patient also specified the door's location: 'on the left side.' The patient was emphatic that this was an accurate detail and noted it had been present the whole time but that they had only now noticed the color clearly. Patient was composed."
    techNote="Blue door confirmed. Location: left side. Unprompted. Patient emphatic about accuracy. Consistent with checklist item added under 7A amendment. Rating 5/5."
    mdNote="Blue door, left side. Consistent with cohort. Add to environmental checklist for this participant going forward."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=11; date="2010-03-03"; duration="7h 48m"; rating="5 / 5"
    sleepStages=@{WASO=9; REM=26; N1=5; N2=47; N3=24}
    narrative="Patient described all prior elements and began attempting to describe what was beyond the blue door. Patient said the door was no longer simply visible from across the room but that they had been standing near it, or moving toward it. Session was briefly interrupted at this point for equipment calibration (approximately four minutes). When the debrief resumed, patient said they could no longer access the description clearly. The impression had faded. Patient was not distressed but appeared mildly frustrated."
    techNote="Patient attempted to describe content beyond the blue door. Session interrupted — equipment calibration, approx. 4 minutes. Patient could not re-access description after interruption. Interruption noted in session log. Rating 5/5.
<!-- equipment calibration note: recalibration was not scheduled. Initiated by attending technician per supervisor instruction. -->"; mdNote="Interruption documented. Timing noted. Continue standard protocol."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=12; date="2010-05-05"; duration="7h 39m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=27; N1=5; N2=46; N3=26}
    narrative="Patient reported all familiar elements. Provided directional clarification on the bending corridor: the hallway 'always bends left.' Patient used the word 'always,' suggesting this is a stable feature rather than a detail that has varied between sessions. Patient offered no additional explanation for the choice of phrasing."
    techNote="Corridor direction confirmed: left. Patient used the word 'always' without prompting, suggesting a perceived invariant feature of the space. Consistent with P-007 Session 14 notation. Rating 5/5."
    mdNote="'Always bends left.' Directional consistency across cohort confirmed. Update checklist."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=13; date="2010-07-07"; duration="8h 04m"; rating="5 / 5"
    sleepStages=@{WASO=7; REM=28; N1=4; N2=45; N3=28}
    narrative="Patient asked, during the debrief, what was at the end of the hallway. The question was framed as genuine curiosity rather than as a recall report — the patient seemed to be asking us rather than trying to remember. The question was not addressed per protocol. Patient accepted the non-response and did not press further. No new recall elements reported in this session beyond previously established ones."
    techNote="Patient asked what was at the end of the hallway. Not addressed per protocol. Patient did not appear troubled by the non-response. All prior elements confirmed. Rating 5/5."
    mdNote="Patient question documented. Framing suggests awareness that the space has a defined endpoint. Do not respond to direct questions about unexplored areas."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=14; date="2010-09-01"; duration="7h 55m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=27; N1=5; N2=46; N3=26}
    narrative="Patient described a new element: a vending machine. Placed it near the waiting area, adjacent to the main corridor. Did not describe the machine's contents or markings. Said it was 'just there, like it belonged.' Patient's tone was neutral, treating the vending machine as an unremarkable environmental fixture."
    techNote="New element: vending machine. Location: near waiting area / adjacent to main corridor. No description of contents. Patient demeanor was neutral. Consistent with P-011 environmental description. Rating 5/5."
    mdNote="Vending machine added. Location consistent with P-011. Cross-reference."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=15; date="2010-11-03"; duration="8h 12m"; rating="5 / 5"
    sleepStages=@{WASO=6; REM=29; N1=4; N2=44; N3=29}
    narrative="All established elements confirmed. Patient showed no new additions in terms of content. Post-session checklist (revised form, post-7A amendment) administered and completed. All environmental elements checked present. Patient confirmed each element when asked whether they had seen it. Room number: patient could not confirm a visible room number."
    techNote="Environmental checklist (7A-EC-004) completed:
Corridor present: Y  |  Bends left: Y  |  Blue door: Y
Reception desk: Y  |  Vending machine: Y  |  Room number visible: N

<!-- checklist version: 7A-EC-004 - do not use pre-amendment version after 2010-09 -->
Rating 5/5."; mdNote="Checklist complete. All core elements confirmed. Room number not yet reported. Continue standard protocol."; mdInitials="M.E."
    flagged=$true; keyClue="Revised environmental checklist administered. Blue door Y, corridor Y, bends left Y, reception desk Y, vending machine Y. Room number: N."
  },
  @{
    n=16; date="2011-01-05"; duration="7h 58m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=27; N1=5; N2=45; N3=27}
    narrative="Patient reported a new element: writing on a wall. Could not read it. Described it as a line of text at approximately eye level, on a wall near the corridor. Patient said the text was in a plain typeface or handwriting — could not distinguish. Was unable to read any of the words despite multiple attempts during the debrief. Said the impression was clear but the content was not accessible."
    techNote="New element: writing on a wall. Location: near corridor. Patient could not read text. Described as 'a line of text.' Could not confirm handwriting vs. print. Rating 5/5."
    mdNote="Written text introduced. Legibility zero at this session. Log for subsequent sessions. Do not describe or hint at content."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=17; date="2011-03-02"; duration="8h 06m"; rating="5 / 5"
    sleepStages=@{WASO=7; REM=28; N1=4; N2=44; N3=28}
    narrative="Patient reported the writing again. This time, partial content accessible. Patient described it as 'an instruction' — said it told you to wait, or to keep waiting. Patient's exact words: 'It told you to wait. Or to keep waiting. Something like that.' Could not recall the exact wording. Said the impression was that the text was directive in nature, not a label or a name."
    techNote="Wall text: partial content recalled. Described as an instruction. Patient verbatim: 'It told you to wait. Or to keep waiting. Something like that.' Directive content confirmed. Exact wording not accessible. Rating 5/5."; mdNote="Wall text content emerging. Directive in nature. Verbatim recorded. Cross-reference with cohort for text consistency."; mdInitials="M.E."
    flagged=$true; keyClue="Wall text: 'an instruction.' Patient verbatim: 'It told you to wait. Or to keep waiting. Something like that.'"
  },
  @{
    n=18; date="2011-06-01"; duration="7h 49m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=27; N1=5; N2=45; N3=27}
    narrative="Patient described a door at the far end of the corridor, beyond the vending machine. The door was closed. Patient could not see through or past it. No number or marking visible on the door. Patient said it was distinct from the blue door — that door remained on the left, this door was at the end. Patient's tone remained matter-of-fact."
    techNote="New element: door at end of corridor, beyond vending machine. Distinct from blue door. Closed. No number or marking described. Rating 5/5."
    mdNote="Second door introduced — corridor terminus. Distinguish from blue door (left side). Log for cross-reference."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=19; date="2011-09-07"; duration="8h 19m"; rating="5 / 5"
    sleepStages=@{WASO=6; REM=30; N1=4; N2=43; N3=29}
    narrative="Patient reported that the door at the end of the corridor appeared to have a number on it during this session. Patient was uncertain about this and could not confirm the number clearly. Debrief session was extended 17 minutes past the standard protocol endpoint. The patient continued attempting to recall the number but could not resolve it with confidence."
    techNote="Door at corridor end: patient reports number visible. Could not confirm. Debrief extended 17 minutes past standard endpoint. Dr. Ellison present for final 10 minutes of extended debrief.
Note: door number not confirmed at this session. Do not record a number in checklist until patient volunteers it independently without prompting. Rating 5/5."; mdNote="Number emerging. Not yet confirmed. Debrief extension authorized. Continue."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=20; date="2012-02-01"; duration="8h 33m"; rating="5 / 5"
    sleepStages=@{WASO=5; REM=31; N1=4; N2=42; N3=30}
    narrative="Patient reported the room number clearly and without prompting at the start of the recall description. The number is 413. Patient said they had seen it on the door and that it was unambiguous. Patient was calm and appeared almost relieved to have resolved the detail. No distress. Patient asked if this was significant. The question was not addressed per protocol."
    techNote="Room number confirmed: 413. Unprompted. Patient stated this was unambiguous. Patient asked if significant — not addressed per protocol.
<!-- Flagged for supplemental review — see 7A index. Consistent with P-007 Session 22 and P-031 Session 18. -->
Rating 5/5."; mdNote="413 confirmed. Cross-reference P-007 S22 and P-031 S18. Flag for supplemental review per 7A protocol."; mdInitials="M.E."
    flagged=$true; keyClue="Room number 413 confirmed unprompted. Consistent with P-007 S22 and P-031 S18. Flagged for 7A supplemental review."
  },
  @{
    n=21; date="2012-09-05"; duration="8h 08m"; rating="5 / 5"
    sleepStages=@{WASO=7; REM=29; N1=4; N2=44; N3=28}
    narrative="Patient reported being 'expected' at the door. When asked what this meant, the patient said they had a sense that something or someone knew they were going to arrive at that door eventually. Could not describe this in more concrete terms. Said it was not a threatening feeling but simply a sense of inevitability. The door had not opened in any previous session. Patient confirmed this."
    techNote="Patient describes sense of being 'expected' at door 413. Did not specify by whom or by what. Door has not opened in any session per patient account. Patient confirmed. Tone was not distressed. Rating 5/5."
    mdNote="'Expected.' Log and cross-reference. Passive expectation. Door status: closed across all sessions to date."; mdInitials="M.E."
    flagged=$false; keyClue=$null
  },
  @{
    n=22; date="2013-08-04"; duration="7h 57m"; rating="5 / 5"
    sleepStages=@{WASO=8; REM=28; N1=5; N2=44; N3=27}
    narrative="Patient confirmed all prior elements. Added new observation about the vending machine: said it 'accepts room keys.' Did not explain what this meant or what happened when a key was used. Patient could not recall whether they had a key. At the close of the session, the patient requested to discontinue participation in the study. The request was honored without condition. Patient appeared calm. No distress indicators. Patient mentioned, before leaving, that they had been dreaming about this office."
    techNote="Vending machine: accepts room keys. Patient could not elaborate on mechanism or outcome. Patient voluntarily withdrew consent at close of session. No condition applied. Termination report filed under 7A-T-PTX018.
<!-- FINAL SESSION - patient withdrew consent 2013-08-04.
     Patient's final remark: 'I've been dreaming about this office.'
     Cross-reference P-011, P-031 re: vending machine key function. -->
Rating 5/5."; mdNote="Study concluded. Participant withdrawal accepted. Full termination report filed. See 7A-T-PTX018."; mdInitials="M.E."
    flagged=$true; keyClue="Vending machine accepts room keys. Patient withdrew consent. Final remark: patient reports dreaming about this office."
  }
)

$beaconScript = @'
<script type="text/javascript">
(function(){try{var _p='ptx-018';var _v='';try{_v=localStorage.getItem('sntk_vis')||'';}catch(x){}var _r=document.referrer||'';var _d=JSON.stringify({p:_p,r:_r,v:_v});if(navigator.sendBeacon){navigator.sendBeacon('/api/beacon',new Blob([_d],{type:'application/json'}));}else{var x=new XMLHttpRequest();x.open('POST','/api/beacon',true);x.setRequestHeader('Content-Type','application/json');x.send(_d);}}catch(e){}}());
</script>
'@

foreach ($s in $sessions) {
  $n     = $s.n
  $nn    = $n.ToString().PadLeft(2,'0')
  $prev  = if ($n -gt 1)  { "<a href=""session-{0}.html"" class=""nav-link"">&laquo; Session {0}</a>" -f ($n-1).ToString().PadLeft(2,'0') } else { "" }
  $next  = if ($n -lt 22) { "<a href=""session-{0}.html"" class=""nav-link"">Session {0} &raquo;</a>" -f ($n+1).ToString().PadLeft(2,'0') } else { "<em>No further sessions on record.</em>" }

  $stages = $s.sleepStages

  # Format technician note — preserve any embedded HTML comments
  $techRaw = $s.techNote -replace "`n", "`n              "

  $flagNote = ""
  if ($s.flagged -and $s.keyClue) {
    $flagNote = @"
      <!-- FLAGGED: $($s.keyClue) -->
"@
  }

  $content = @"
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="robots" content="noindex, nofollow" />
<title>Session $nn Recall Summary &mdash; PTX-018 | Somnatek Patient Portal</title>
<link rel="stylesheet" type="text/css" href="../../style.css" />
<style type="text/css">
.recall-form { border: 1px solid #b0bec5; margin-bottom: 18px; }
.recall-form-header { background: #dde4ea; padding: 8px 12px; border-bottom: 1px solid #b0bec5; }
.recall-form-header table { width: 100%; }
.recall-form-header td { font-size: 11px; font-family: Verdana, Arial, sans-serif; color: #2c4a6b; padding: 1px 8px 1px 0; }
.recall-form-header td.field-label { color: #888; width: 110px; }
.recall-form-header .form-id { font-weight: bold; font-size: 13px; color: #1a3f5a; }
.form-section { padding: 10px 14px; border-bottom: 1px solid #dde4ea; }
.form-section:last-child { border-bottom: none; }
.form-section h4 { font-family: Verdana, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; margin: 0 0 8px 0; border-bottom: 1px solid #eaeaea; padding-bottom: 4px; }
.form-section p { font-family: Georgia, "Times New Roman", serif; font-size: 12px; line-height: 1.7; color: #333; margin: 0 0 6px 0; }
.tech-note { font-family: Georgia, serif; font-size: 12px; font-style: italic; color: #2a2a3a; line-height: 1.7; white-space: pre-line; }
.sleep-stage-table { width: 100%; font-size: 11px; border-collapse: collapse; }
.sleep-stage-table th { background: #edf1f5; border: 1px solid #c8d4dc; padding: 4px 8px; text-align: left; font-family: Verdana, sans-serif; font-weight: bold; color: #445; }
.sleep-stage-table td { border: 1px solid #d0dce4; padding: 4px 8px; font-family: Verdana, sans-serif; color: #333; }
.rating-display { font-size: 22px; color: #2a5f8a; font-family: Georgia, serif; letter-spacing: 2px; }
.session-nav { overflow: hidden; margin-bottom: 12px; font-size: 11px; font-family: Verdana, sans-serif; }
.session-nav .nav-prev { float: left; }
.session-nav .nav-next { float: right; }
a.nav-link { color: #2a5f8a; text-decoration: none; }
a.nav-link:hover { text-decoration: underline; }
.md-sign { border-top: 1px solid #dde4ea; padding-top: 8px; margin-top: 4px; font-size: 11px; font-family: Verdana, sans-serif; color: #888; }
</style>
<!-- session-integrity:check -->
$beaconScript
</head>
<body>

<div id="wrapper">

  <div id="header">
    <div id="header-inner">
      <div id="header-contact">
        Tel: (404) 551-4145<br />
        Fax: (404) 671-9774
      </div>
      <div id="site-title">Somnatek Sleep Health Center</div>
      <div id="site-subtitle">Patient Portal &mdash; Archived Records Access</div>
    </div>
  </div>

  <div id="topnav">
    <ul>
      <li><a href="../../index.html">Home</a></li>
      <li><a href="../../portal.html" class="active">Patient Portal</a></li>
    </ul>
  </div>

  <div id="breadcrumb">
    <a href="../../index.html">Home</a> &gt;
    <a href="../../portal.html">Patient Portal</a> &gt;
    <a href="index.html">PTX-018</a> &gt;
    Session $nn
  </div>

  <div id="content-wrapper">

    <div id="sidebar">
      <h3>PTX-018</h3>
      <ul>
        <li><a href="index.html">Session Index</a></li>
        <li><a href="session-$nn.html" class="active">Session $nn</a></li>
      </ul>
      <div id="sidebar-note">
        Archive access is provided for participant record review only. Records are read-only.
      </div>
    </div>

    <div id="main">

      <div class="session-nav">
        <span class="nav-prev">$prev</span>
        <span class="nav-next">$next</span>
      </div>

      <h1>Recall Summary &mdash; Session $nn</h1>
$flagNote
      <div class="recall-form">

        <div class="recall-form-header">
          <div class="form-id">PTX-018 / Session $nn &mdash; $($s.date)</div>
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td class="field-label">Duration:</td><td>$($s.duration)</td>
              <td class="field-label">Recall rating:</td><td><strong>$($s.rating)</strong></td>
            </tr>
            <tr>
              <td class="field-label">Technician:</td><td>L. Ortiz</td>
              <td class="field-label">Reviewing physician:</td><td>Dr. M. Ellison</td>
            </tr>
          </table>
        </div>

        <div class="form-section">
          <h4>Sleep Stage Summary</h4>
          <table class="sleep-stage-table" cellpadding="0" cellspacing="0">
            <tr>
              <th>Stage</th><th>% of TST</th>
            </tr>
            <tr><td>WASO (Wake after sleep onset)</td><td>$($stages.WASO)%</td></tr>
            <tr><td>Stage N1</td><td>$($stages.N1)%</td></tr>
            <tr><td>Stage N2</td><td>$($stages.N2)%</td></tr>
            <tr><td>Stage N3 (slow-wave)</td><td>$($stages.N3)%</td></tr>
            <tr><td>REM</td><td>$($stages.REM)%</td></tr>
          </table>
        </div>

        <div class="form-section">
          <h4>Patient Recall Narrative</h4>
          <p>$($s.narrative)</p>
        </div>

        <div class="form-section">
          <h4>Technician Notes</h4>
          <p class="tech-note">$techRaw</p>
        </div>

        <div class="form-section">
          <h4>Physician Review</h4>
          <p>$($s.mdNote)</p>
          <div class="md-sign">Reviewed: $($s.date) &nbsp;&mdash;&nbsp; $($s.mdInitials)</div>
        </div>

      </div>

      <p style="text-align:center; margin-top:4px;">
        <a href="index.html">&laquo; Return to session index</a>
      </p>

    </div>

  </div>

  <div id="footer">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          Somnatek Sleep Health Center &mdash; 465 Upper Riverdale Road, Suite 2, Harrow County, GA 30274<br />
          Tel: (404) 551-4145 &nbsp;|&nbsp; <a href="mailto:records@somnatek.org">records@somnatek.org</a>
        </td>
        <td align="right" valign="top">
          <a href="../../portal.html">Return to Portal</a> &nbsp;|&nbsp;
          <a href="../../closure-notice.html">Closure Notice</a>
        </td>
      </tr>
    </table>
    <div style="margin-top:6px;">
      &copy; 2006&ndash;2014 Somnatek Sleep Health Center. All rights reserved.
    </div>
  </div>

</div>

</body>
</html>
"@

  $outPath = Join-Path $outDir "session-$nn.html"
  $content | Out-File -FilePath $outPath -Encoding utf8 -NoNewline
  Write-Host "Written: session-$nn.html"
}

Write-Host "DONE - $($sessions.Count) session files generated."
