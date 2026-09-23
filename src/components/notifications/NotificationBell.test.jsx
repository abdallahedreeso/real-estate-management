import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationBell from "./NotificationBell";

const mock = vi.hoisted(() => ({ client: null, handlers: {}, navigate: vi.fn() }));

vi.mock("@clerk/clerk-react", () => ({ useAuth: () => ({ userId: "recipient-1" }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key, i18n: { language: "en" } }) }));
vi.mock("react-router-dom", () => ({ useNavigate: () => mock.navigate }));
vi.mock("@/backend/supabase/supabase", () => ({ default: () => mock.client }));

const query = (result) => ({
  eq() { return this; }, order() { return this; }, is() { return this; },
  limit() { return this; }, in() { return this; },
  then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
});

describe("incoming message notifications", () => {
  beforeEach(() => {
    mock.handlers = {};
    mock.navigate.mockClear();
    const channel = {
      on(_type, filter, callback) { mock.handlers[filter.event] = callback; return this; },
      subscribe(callback) { callback("SUBSCRIBED"); return this; },
    };
    mock.client = {
      from() { return {
        select(_columns, options) { return query(options?.head ? { count: 0, error: null } : { data: [], error: null }); },
        update() { return query({ error: null }); },
      }; },
      channel() { return channel; },
      removeChannel() {},
    };
  });

  it("shows each recipient message in sequence and opens its conversation", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(mock.handlers.INSERT).toBeTypeOf("function"));
    await act(async () => {
      mock.handlers.INSERT({ new: { id: "message-one", recipient_id: "recipient-1", conversation_id: "conversation-one" } });
      mock.handlers.INSERT({ new: { id: "message-two", recipient_id: "recipient-1", conversation_id: "conversation-two" } });
    });

    fireEvent.click(screen.getByRole("status").querySelector(".notification-toast-open"));
    expect(mock.navigate).toHaveBeenNthCalledWith(1, "/Messages?conversation=conversation-one");
    fireEvent.click(screen.getByRole("status").querySelector(".notification-toast-open"));
    expect(mock.navigate).toHaveBeenNthCalledWith(2, "/Messages?conversation=conversation-two");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("does not alert for another recipient or duplicate delivery", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(mock.handlers.INSERT).toBeTypeOf("function"));
    await act(async () => {
      mock.handlers.INSERT({ new: { id: "other", recipient_id: "someone-else", conversation_id: "another" } });
      mock.handlers.INSERT({ new: { id: "own", recipient_id: "recipient-1", conversation_id: "mine" } });
      mock.handlers.INSERT({ new: { id: "own", recipient_id: "recipient-1", conversation_id: "mine" } });
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    fireEvent.click(screen.getByLabelText("notifications.dismiss"));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
