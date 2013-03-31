;; load this file by including the below line in your .emacs
;; (load-file "~/path/to/scrounge.el")

(defvar *Scrounge-Path* "~/Software/scroungejs/scrounge.js")
(defvar *Project-Source-Hash* (make-hash-table :test 'equal))
(defvar *Project-Scrounge-Hash* (make-hash-table :test 'equal))
(defvar *Basepage-Path-Hash* (make-hash-table :test 'equal))
(defvar *Project-Root-Hash* (make-hash-table :test 'equal))
(defvar *Public-Root-Hash* (make-hash-table :test 'equal))
(defvar *Err-Log-Hash* (make-hash-table :test 'equal))

(puthash "iammegumi" "~/Software/iammegumi.com/sources/appSrc" *Project-Source-Hash*)
(puthash "iammegumi" "~/Software/iammegumi.com/sources/app" *Project-Scrounge-Hash*)
(puthash "iammegumi" "~/Software/iammegumi.com/sources/index.mustache" *Basepage-Path-Hash*)
(puthash "iammegumi" "~/Software/iammegumi.com" *Project-Root-Hash*)
(puthash "iammegumi" "/app" *Public-Root-Hash*)

;;(puthash "scroungejs" "~/Software/scroungejs.com/sources/appSrc" *Project-Source-Hash*)
;;(puthash "scroungejs" "~/Software/scroungejs.com/sources/app" *Project-Scrounge-Hash*)
;;(puthash "scroungejs" "~/Software/scroungejs.com/sources/index.mustache" *Basepage-Path-Hash*)
;;(puthash "scroungejs" "~/Software/scroungejs.com" *Project-Root-Hash*)
;;(puthash "scroungejs" "/app" *Public-Root-Hash*)

(puthash "scroungejs" "~/Software/scroungejs" *Project-Root-Hash*)

(puthash "kuaadmin" "~/Software/kuaweb/sources/appSrc" *Project-Source-Hash*)
(puthash "kuaadmin" "~/Software/kuaweb/sources/app" *Project-Scrounge-Hash*)
(puthash "kuaadmin" "~/Software/kuaweb/sources/admin.html" *Basepage-Path-Hash*)
(puthash "kuaadmin" "~/Software/kuaweb" *Project-Root-Hash*)
(puthash "kuaadmin" "/app" *Public-Root-Hash*)

(puthash "kuaweb" "~/Software/kuaweb/sources/appSrc" *Project-Source-Hash*)
(puthash "kuaweb" "~/Software/kuaweb/sources/app" *Project-Scrounge-Hash*)
(puthash "kuaweb" "~/Software/kuaweb/sources/index.html" *Basepage-Path-Hash*)
(puthash "kuaweb" "~/Software/kuaweb" *Project-Root-Hash*)
(puthash "kuaweb" "~/Software/kuaweb/log/out.log" *Err-Log-Hash*)
(puthash "kuaweb" "/app" *Public-Root-Hash*)

(puthash "kuawebHTTP" "~/Software/kuaweb/sources/appSrc" *Project-Source-Hash*)
(puthash "kuawebHTTP" "~/Software/kuaweb/sources/app" *Project-Scrounge-Hash*)
(puthash "kuawebHTTP" "~/Software/kuaweb/sources/indexHTTP.html" *Basepage-Path-Hash*)
(puthash "kuawebHTTP" "~/Software/kuaweb" *Project-Root-Hash*)
(puthash "kuawebHTTP" "/app" *Public-Root-Hash*)

(puthash "cucumberWeb" "~/Software/cucumberWeb/sources/appSrc" *Project-Source-Hash*)
(puthash "cucumberWeb" "~/Software/cucumberWeb/sources/app" *Project-Scrounge-Hash*)
(puthash "cucumberWeb" "~/Software/cucumberWeb/sources/index.mustache" *Basepage-Path-Hash*)
(puthash "cucumberWeb" "~/Software/cucumberWeb" *Project-Root-Hash*)
(puthash "cucumberWeb" "~/Software/cucumberWeb/log/out.log" *Err-Log-Hash*)
(puthash "cucumberWeb" "/app" *Public-Root-Hash*)


(puthash "briannarigg.com" "~/Software/briannarigg.com/sources/appSrc" *Project-Source-Hash*)
(puthash "briannarigg.com" "~/Software/briannarigg.com/sources/app" *Project-Scrounge-Hash*)
(puthash "briannarigg.com" "~/Software/briannarigg.com/sources/index.mustache" *Basepage-Path-Hash*)
(puthash "briannarigg.com" "~/Software/briannarigg.com" *Project-Root-Hash*)
(puthash "briannarigg.com" "~/Software/briannarigg.com/log/out.log" *Err-Log-Hash*)
(puthash "briannarigg.com" "/app" *Public-Root-Hash*)



;; FOCUS SITE
(defvar focus-site "devilmaycare")

(defun get-focus-sites() (interactive)
  (let ((keys-string ""))
    (progn
      (maphash '(lambda (key value) 
                  (setq keys-string (concat keys-string " " key))) *Project-Root-Hash*)
      (print (concat "Focus sites:" keys-string)))))

(defun set-focus-site (site) (interactive "sFocus scrounge on what?: " (get-focus-sites))
  "set a focus page for scrounge. page must be a key at scrounge hash."
  (setq focus-site site))

(global-set-key (kbd "C-c f") 'set-focus-site)



;; VALIDATE JSON
;;(defun JSON () (interactive)
;;  (let ((file-name buffer-file-name))
;;    (shell-command (concat "node ~/Software/json-parse.js -i " file-name))))



;; DEPLOY NODE
(defun Deploy (&optional site) (interactive "sSingle-assemble which site?: ")
  "calls mvn assembly process on specified directory path"
  (princ focus-site)
  (let ((compile-dir (gethash focus-site *Project-Root-Hash*))
        (persist-dir default-directory))
    (cd compile-dir)
    (setq compilation-scroll-output t)
    (compile (concat "bash ./bash/app_deploy.sh"))
    (cd persist-dir)))

(global-set-key (kbd "C-c s") (lambda() (interactive) (Deploy focus-site)))
;;(global-set-key (kbd "C-c s") (lambda() (interactive) (print "go")))




;; TAIL NODE
(defun tailLog (&optional type) (interactive "sTail error log for which site?: ")
  (let ((site (if type type focus-site))
        (errlog (gethash focus-site *Err-Log-Hash*)))
;;    (message (concat "Tail: " focus-site))

    (if errlog
        (shell-command (concat "tail -f " errlog "&"))
      (message (concat "Unfamiliar log type. " focus-site)))))

(global-set-key (kbd "C-c l") (lambda() (interactive) (tailLog focus-site)))

(defun Unit-Tests () (interactive)
  "unit test the focus site"
  (let ((compile-dir (gethash focus-site *Project-Root-Hash*))
        (persist-dir default-directory))
    (cd compile-dir)
    (setq compilation-scroll-output t)
    (ansi-color-for-comint-mode-on)
    (shell-command "npm test")
    (cd persist-dir)))

;;(global-set-key (kbd "C-c u") (lambda() (interactive) (tailLog focus-site)))
(global-set-key (kbd "C-c u") 'Unit-Tests)


;; SCROUNGE COMMANDS
(defun Scrounge (&optional type is-fake) (interactive)
  "compress the buffer file with scrounge"
  (setq compilation-scroll-output t)
  (if (and focus-site (gethash focus-site *Project-Root-Hash*))
      (let* ((project-path (gethash focus-site *Project-Source-Hash*))
             (public-path (gethash focus-site *Project-Scrounge-Hash*))
             (public-root-path (gethash focus-site *Public-Root-Hash*))
             (basepage-path (gethash focus-site *Basepage-Path-Hash*)))
        (compile (concat "node " *Scrounge-Path* " -l --isRecursive=true --isTimestamped=true --isRemoveRequires=true "
                         (if is-fake " --isCompressed=false" " --isCompressed=true")
                         (if is-fake " --isConcatenation=false" " --isConcatenation=true")
                         (if is-fake "" " --isRemoveConsole=true")
                         (if public-root-path (concat " --publicPath=" public-root-path) "")
                         (if basepage-path (concat " --basepage=" basepage-path) "")                         
                         (if project-path (concat " --inputPath=" project-path) "")
                         (if public-path (concat " --outputPath=" public-path) ""))))))


(defun Scrounge-source (&optional type is-fake) (interactive)
  "compress the buffer file with scrounge"
  (setq compilation-scroll-output t)
  (if (and focus-site (gethash focus-site *Project-Root-Hash*))
      (let* ((project-path (gethash focus-site *Project-Source-Hash*))
             (public-path (gethash focus-site *Project-Scrounge-Hash*))
             (public-root-path (gethash focus-site *Public-Root-Hash*))
             (basepage-path (gethash focus-site *Basepage-Path-Hash*)))
        (compile 
         (concat "node " *Scrounge-Path* " -l --isRecursive=true --isBasepageSourcePaths=true --isRemoveRequires=true "
                 (if basepage-path (concat " --basepage=" basepage-path) "")                         
                 (if project-path (concat " --inputPath=" project-path) "")
                 (if public-path (concat " --publicPath=" "/appSrc") ""))))))



(defun Scrounge-warn (&optional type is-fake) (interactive)
  "compress the buffer file with scrounge"
  (setq compilation-scroll-output t)
  (if (and focus-site (gethash focus-site *Project-Root-Hash*))
      (let* ((project-path (gethash focus-site *Project-Source-Hash*))
             (public-path (gethash focus-site *Project-Scrounge-Hash*))
             (public-root-path (gethash focus-site *Public-Root-Hash*))
             (basepage-path (gethash focus-site *Basepage-Path-Hash*)))
        (compile (concat "node " *Scrounge-Path* " -l --isRecursive=true --isTimestamped=true --isWarning=true  --isRemoveRequires=true "
                         (if is-fake " --isCompressed=false ")
                         (if is-fake " --isConcatenation=false ")
                         (if public-root-path (concat " --publicPath=" public-root-path) "")
                         (if basepage-path (concat " --basepage=" basepage-path) "")                         
                         (if project-path (concat " --inputPath=" project-path) "")
                         (if public-path (concat " --outputPath=" public-path) ""))))))


(defun Cmpr-fake () (interactive)
  "scrounge -f _only_ files of type being edited in the buffer"
  (let ((extn (file-name-extension buffer-file-name)))
    (cond ((equal extn "js") (Scrounge "js" "fake"))
          ((equal extn "css") (Scrounge "css" "fake"))
          (t nil))))

(defun Cmpr-warn () (interactive)
  "scrounge -f _only_ files of type being edited in the buffer"
  (let ((extn (file-name-extension buffer-file-name)))
    (cond ((equal extn "js") (Scrounge-warn "js" "fake"))
          ((equal extn "css") (Scrounge-warn "css" "fake"))
          (t nil))))

(defun Cmpr-real () (interactive)
  "scrounge _only_ files of type being edited in the buffer"
  (let ((extn (file-name-extension buffer-file-name)))
    (cond ((equal extn "js") (Scrounge "js"))
          ((equal extn "css") (Scrounge "css"))
          (t nil))))

(defun Cmpr-all () (interactive)
  "scrounge all files",
  (Scrounge))

(global-set-key (kbd "C-c n") (lambda() (interactive) (Cmpr-real)))
(global-set-key (kbd "C-c m") (lambda() (interactive) (Cmpr-fake)))
(global-set-key (kbd "C-c c") (lambda() (interactive) (Cmpr-warn)))


(defun concat-all-css () (interactive)
  (let
      ((bashScriptsDir
       (gethash focus-site *Scrounge-BashScripts-Syspath-Hash*))
       (views-dir (gethash focus-site *Scrounge-Mint-Syspath-Hash*)))
    (shell-command-to-string 
     (concat "bash " bashScriptsDir "/build_css.sh -i " views-dir "/ -o " views-dir "/../css/Main_concat.css"))))

(defun string-replace (from to string &optional re)
  (let ((pos 0)
        (res "")
        (from (if re from (regexp-quote from))))
    (while (< pos (length string))
      (if (setq beg (string-match from string pos))
          (progn
            (setq res (concat res
                              (substring string pos (match-beginning 0))
                              to))
            (setq pos (match-end 0)))
        (progn
          (setq res (concat res (substring string pos (length string))))
          (setq pos (length string)))))
    res))

(defun get-file-timestamp (file-name) ()
  "get the a timestamp from a _mint stamp"
  (let* ((regexp "^\.*Timestamp:\[a-Z ]*(\[0-9\]*.\[0-9\]*.\[0-9\]*)\.*")
         (match (shell-command-to-string
                 (concat "egrep -i '" regexp "' " file-name))))
    (if (> (length match) 1)
        (let ((p (string-match "\\(\[0-9\]+.\[0-9\]+.\[0-9\]+\\)" match)))
          (substring match p (match-end 0))))))

(defun is-scrounge-file (file-name) ()
  "is the buffer file a scrounge file? is `Filename: $name` on first line?"
  (let* ((extn (file-name-extension buffer-file-name)))
    (if (or (equal extn "js") 
            (equal extn "css"))
               
        (let* ((regexp "^(//|/\\*) Filename:\.*")
               (match (shell-command-to-string
                       (concat "egrep -i '" regexp "' " file-name))))
          (if (> (length match) 1) "true")))))

(defun check () (interactive)
  (print (is-scrounge-file buffer-file-name)))


(defun full-js-stamp() (interactive)
  "add a full js mint stamp to the top of the buffer file"
  (let ((filename (file-name-nondirectory buffer-file-name)))
    (concat 
     "// Filename: " (string-replace "_mint" "" filename) "  \n"
     "// Timestamp: " (format-time-string "%Y.%m.%d-%H:%M:%S") " (last modified)  \n"
     "// Author(s): Bumblehead (www.bumblehead.com)  \n")))

(defun full-css-stamp() (interactive)
  "add a full css mint stamp to the top of the buffer file"
  (let ((filename (file-name-nondirectory buffer-file-name)))
    (concat 
     "/* Filename: " (string-replace "_mint" "" filename) "  \n"
     " * Timestamp: " (format-time-string "%Y.%m.%d-%H:%M:%S") " (last modified)  \n"
     " * Author(s): Bumblehead (www.bumblehead.com)  \n"
     " */")))

(defun time-stamp() (interactive)
  "updates/adds buffer-file timestamp
  '// Timestamp: 2011.05.21 (last modified)'
  '/* Timestamp: 2011.05.21 (last modified) */'"
  (let* ((regexp "^\.*Timestamp:\[a-Z ]*\\(\[0-9\]+.\[0-9\]+.\[0-9\]+\\)\.*")
         (extn (file-name-extension (buffer-file-name)))
         (time (format-time-string "%Y.%m.%d-%H:%M:%S"))
         (timestamp
          (cond ((equal extn "js")
                 (concat "// Timestamp: " time " (last modified)  "))
                ((equal extn "css")
                 (concat " * Timestamp: " time " (last modified)  "))
                (t
                 (concat "// Timestamp: " time " (last modified)  "))))
         (old-point (point)))
    (beginning-of-buffer)   
    (if (re-search-forward regexp nil t)
        (if (equal (match-string 1) time)
            (goto-char old-point)
          (replace-match timestamp)
          (goto-char old-point))
      (insert (if (equal extn "css") (full-css-stamp) (full-js-stamp))))
    time))

(defun cp-bufferfile-to-scrounge-dir() (interactive) 
  (if (and focus-site (gethash focus-site *Project-Root-Hash*))
      (let* ((scrounge-root (gethash focus-site *Project-Scrounge-Hash*))      
             (file-name (file-name-nondirectory buffer-file-name)))
        (shell-command-to-string
         (concat "cp " buffer-file-name " " scrounge-root "/" file-name)))))


(defun show-path () (interactive)
  (print *Scrounge-Path*))


(defun Scrounge-update-buffer-file (&optional type is-fake) (interactive)
  "compress the buffer file with scrounge"
  (setq compilation-scroll-output t)
  (if (and focus-site (gethash focus-site *Project-Root-Hash*))
      (let* ((project-path (gethash focus-site *Project-Source-Hash*))
             (public-path (gethash focus-site *Project-Scrounge-Hash*))
             (public-root-path (gethash focus-site *Public-Root-Hash*))
             (basepage-path (gethash focus-site *Basepage-Path-Hash*)))
        (shell-command-to-string 
         (concat "node " *Scrounge-Path* 
                 " -l --isRecursive=true --isTimestamped=true --isUpdateOnly=true --isSilent=true --isRemoveRequires=true "
                 (if is-fake " --isCompressed=false ")
                 (if is-fake " --isConcatenation=false")
                 (if public-root-path (concat " --publicPath=" public-root-path) "")
                 (if basepage-path (concat " --basepage=" basepage-path) "")                         
                 (if project-path (concat " --inputPath=" buffer-file-name) "")
                 (if public-path (concat " --outputPath=" public-path) ""))))))



(defun update-buffer-file-timestamp () (interactive)
  (let ((extn (file-name-extension buffer-file-name)))
    (if (is-scrounge-file buffer-file-name)
        (time-stamp))))

(defun update-buffer-file () (interactive)
  "check if buffer file is scrounge related -if so, scrounge-update"
  (let* ((mustache-re "mustache$"))
    (progn
      (if (string-match mustache-re buffer-file-name)
          (cp-bufferfile-to-scrounge-dir))
      (if (is-scrounge-file buffer-file-name)
          (Scrounge-update-buffer-file)))))


(add-hook 'write-file-hooks
          '(lambda () ()
             "when saving '_mint' files, add/update mint info at file"
             (update-buffer-file-timestamp)
             nil))

(add-hook 'after-save-hook
          '(lambda ()
             (update-buffer-file)
             nil))
             
(add-hook 'shell-mode-hook 
          'ansi-color-for-comint-mode-on)

(add-hook 'compilation-mode-hook 
          'ansi-color-for-comint-mode-on)

(add-hook 'c-mode-hook 
          'ansi-color-for-comint-mode-on)
