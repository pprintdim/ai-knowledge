# /fix — багфікс

debug → спеціаліст стеку → qa → cleanup

1. [[debug]]: відтворити, root cause (не маскувати симптом).
2. Спеціаліст ([[opencart3]]/[[wordpress]]/[[backend-php]]/[[frontend]]): мінімальний фікс причини у worktree (`task-start.sh`).
3. [[qa]]: diff + regression + перевірка, що симптом зник.
4. [[cleanup]]: push-first → task-done.sh → звіт. Граблі → [[common-bugs]].
