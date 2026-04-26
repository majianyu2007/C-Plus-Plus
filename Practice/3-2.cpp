#include <iostream>
#include <list>
#include <string>

using std::cin;
using std::cout;
using std::endl;
using std::list;
using std::string;

class StudentRecord {
  public:
    string stuName;
    int stuNo;

    void Print() const { cout << stuName << ' ' << stuNo; }
};

class LinkedList {
  private:
    list<StudentRecord> lst;

  public:
    void PushFront(const StudentRecord &record) { lst.push_front(record); }

    void PopFront() { lst.pop_front(); }

    void PushBack(const StudentRecord &record) { lst.push_back(record); }

    void PopBack() { lst.pop_back(); }

    bool Empty() const { return lst.empty(); }

    void Print() const {
        for (const auto &record : lst) {
            record.Print();
            cout << endl;
        }
    }

  protected:
    StudentRecord &Front() { return lst.front(); }

    const StudentRecord &Front() const { return lst.front(); }
};

class LinkedStack : public LinkedList {
  public:
    void Push(const StudentRecord &record) { PushFront(record); }

    bool Pop(StudentRecord &record) {
        if (Empty()) {
            return false;
        }
        record = Front();
        PopFront();
        return true;
    }
};

class LinkedQueue : public LinkedList {
  public:
    void EnQueue(const StudentRecord &record) { PushBack(record); }

    bool DeQueue(StudentRecord &record) {
        if (Empty()) {
            return false;
        }
        record = Front();
        PopFront();
        return true;
    }
};

int main(void) {
    LinkedQueue queue;
    LinkedStack stack;
    string op;

    while (cin >> op) {
        if (op == "Push") {
            StudentRecord record;
            cin >> record.stuName >> record.stuNo;
            stack.Push(record);
        } else if (op == "EnQueue") {
            StudentRecord record;
            cin >> record.stuName >> record.stuNo;
            queue.EnQueue(record);
        } else if (op == "Pop") {
            StudentRecord record;
            if (stack.Pop(record)) {
                record.Print();
                cout << endl;
            } else {
                cout << "Stack is empty!" << endl;
            }
        } else if (op == "DeQueue") {
            StudentRecord record;
            if (queue.DeQueue(record)) {
                record.Print();
                cout << endl;
            } else {
                cout << "Queue is empty!" << endl;
            }
        } else if (op == "Exit" || op == "exit") {
            stack.Print();
            queue.Print();
            break;
        } else {
            cout << "Input error!" << endl;
        }
    }

    return 0;
}
