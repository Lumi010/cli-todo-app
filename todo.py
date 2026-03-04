"""
CLI To-Do App
A simple command-line task manager built using Python fundamentals.

Features:
- Add task
- View tasks
- Delete task
- Input validation
"""

def show_menu():
    print("\n" + "=" * 35)
    print("           TO-DO APP")
    print("=" * 35)
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Delete Task")
    print("4. Mark Task Complete")
    print("5. Exit")
def pause():
    input("\nPress Enter to return to menu...")

def add_task(tasks):
    
    task = input("Enter task: ")
    tasks.append("[ ] " + task)
    save_tasks(tasks)
    print("Task added successfully!")


def view_tasks(tasks):
    if not tasks:
        print("No tasks yet.")
    else:
        print("\nYour Tasks:")
        for i, task in enumerate(tasks):
            print(f"{i+1}. {task}")

    pause()
def mark_complete(tasks):

    print("\nYour Tasks:")

    for i, task in enumerate(tasks):
        print(f"{i+1}. {task}")

    choice = int(input("Enter task number to mark complete: "))

    tasks[choice - 1] = tasks[choice - 1].replace("[ ]", "[x]")

    save_tasks(tasks)

    print("Task marked as complete!")

def delete_task(tasks):
    if not tasks:
        print("No tasks to delete.")
        pause()
        return

    print("\nYour Tasks:")
    for i, task in enumerate(tasks):
        print(f"{i+1}. {task}")

    try:
        delete_choice = int(input("Enter task number to delete: "))

        if 1 <= delete_choice <= len(tasks):
            removed = tasks.pop(delete_choice - 1)
            
            save_tasks(tasks)
            print(f"Task '{removed}' deleted successfully!")
        else:
            print("Invalid task number.")

    except ValueError:
        print("Please enter a valid number.")

    pause()
def save_tasks(tasks):
    with open("tasks.txt", "w") as file:
        for task in tasks:
            file.write(task + "\n")
def main():
    tasks = []

    while True:
        show_menu()
        choice = input("Enter your choice: ")

        if choice == "1":
            add_task(tasks)
        elif choice == "2":
            view_tasks(tasks)
        elif choice == "3":
            delete_task(tasks)
        elif choice == "4":
             mark_complete(tasks)

        elif choice == "5":
             print("Goodbye!")
             break
        else:
            print("Invalid choice. Try again.")


if __name__ == "__main__":
    main()