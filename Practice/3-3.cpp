#include <iostream>
#include <list>
#include <string>

using namespace std;

class StudentRecord {
  public:
    string stuName;
    int stuNo;

    StudentRecord() : stuName(""), stuNo(0) {}
    StudentRecord(const string &name, int no) : stuName(name), stuNo(no) {}

    void Print() const { cout << stuName << " " << stuNo; }
};

class LinkedList {
  private:
    list<StudentRecord> lst;

  public:
    void PushFront(const StudentRecord &record) { lst.push_front(record); }

    bool PopFront(StudentRecord &record) {
        if (lst.empty()) {
            return false;
        }
        record = lst.front();
        lst.pop_front();
        return true;
    }

    void PushBack(const StudentRecord &record) { lst.push_back(record); }

    bool PopBack(StudentRecord &record) {
        if (lst.empty()) {
            return false;
        }
        record = lst.back();
        lst.pop_back();
        return true;
    }

    bool IsEmpty() const { return lst.empty(); }

    void PrintAll() const {
        for (const auto &record : lst) {
            record.Print();
            cout << "\n";
        }
    }
};

class LinkedStack {
  private:
    LinkedList listData;

  public:
    void Push(const StudentRecord &record) { listData.PushFront(record); }

    bool Pop(StudentRecord &record) { return listData.PopFront(record); }

    void PrintAll() const { listData.PrintAll(); }
};

class LinkedQueue {
  private:
    LinkedList listData;

  public:
    void EnQueue(const StudentRecord &record) { listData.PushBack(record); }

    bool DeQueue(StudentRecord &record) { return listData.PopFront(record); }

    void PrintAll() const { listData.PrintAll(); }
};

int main() {
    LinkedQueue queue;
    LinkedStack stack;

    string op;
    while (cin >> op) {
        if (op == "Push") {
            string name;
            int no;
            if (!(cin >> name >> no)) {
                break;
            }
            stack.Push(StudentRecord(name, no));
        } else if (op == "EnQueue") {
            string name;
            int no;
            if (!(cin >> name >> no)) {
                break;
            }
            queue.EnQueue(StudentRecord(name, no));
        } else if (op == "Pop") {
            StudentRecord record;
            if (stack.Pop(record)) {
                record.Print();
                cout << "\n";
            } else {
                cout << "Stack is empty!\n";
            }
        } else if (op == "DeQueue") {
            StudentRecord record;
            if (queue.DeQueue(record)) {
                record.Print();
                cout << "\n";
            } else {
                cout << "Queue is empty!\n";
            }
        } else if (op == "Exit") {
            stack.PrintAll();
            queue.PrintAll();
            break;
        } else {
            cout << "Input error!\n";
        }
    }

    return 0;
}
